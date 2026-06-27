import * as np from "numpy-ts/core";
import type { CalcResult, CalcValue } from "./calculator";

/**
 * Safe evaluator for numpy-ts expressions. Instead of `new Function`/`eval`
 * (which the Convex runtime forbids anyway), we parse the expression into a
 * tiny AST and interpret it, dispatching identifiers **only** against the
 * numpy-ts namespace. No global (fetch, process, timers, constructor chains…)
 * is ever reachable, so a hostile string can at worst call numpy functions.
 */

const NP = np as unknown as Record<string, unknown>;
const ALLOWED_NAMES = new Set(Object.keys(np));
const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
  inf: Number.POSITIVE_INFINITY,
  nan: Number.NaN,
};
// Property names that could climb out of the numpy sandbox (to Function, the
// shared module namespace, etc.). Method access to legitimate NDArray methods
// (.mean, .reshape, .tolist…) is still allowed.
const BLOCKED_PROPS = new Set([
  "constructor",
  "__proto__",
  "prototype",
  "__defineGetter__",
  "__defineSetter__",
  "__lookupGetter__",
  "__lookupSetter__",
]);

const MAX_EXPRESSION_LENGTH = 2000;

type Token =
  | { type: "num"; value: number }
  | { type: "id"; value: string }
  | { type: "punc"; value: string };

const PUNCT = ["**", "+", "-", "*", "/", "%", "(", ")", "[", "]", ",", "."];

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      i++;
      continue;
    }
    // Number: digits with optional fraction and exponent.
    if ((ch >= "0" && ch <= "9") || (ch === "." && /[0-9]/.test(input[i + 1] ?? ""))) {
      const match = /^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(input.slice(i));
      if (!match) throw new Error(`Malformed number at position ${i}.`);
      tokens.push({ type: "num", value: Number(match[0]) });
      i += match[0].length;
      continue;
    }
    // Identifier.
    if (/[A-Za-z_$]/.test(ch)) {
      const match = /^[A-Za-z_$][\w$]*/.exec(input.slice(i));
      const name = match?.[0] ?? "";
      tokens.push({ type: "id", value: name });
      i += name.length;
      continue;
    }
    // Punctuation / operators (two-char first).
    const two = input.slice(i, i + 2);
    if (two === "**") {
      tokens.push({ type: "punc", value: "**" });
      i += 2;
      continue;
    }
    if (PUNCT.includes(ch)) {
      tokens.push({ type: "punc", value: ch });
      i++;
      continue;
    }
    throw new Error(`Unexpected character "${ch}" at position ${i}.`);
  }
  return tokens;
}

type Node =
  | { kind: "num"; value: number }
  | { kind: "id"; name: string }
  | { kind: "array"; items: Node[] }
  | { kind: "unary"; op: string; arg: Node }
  | { kind: "binary"; op: string; left: Node; right: Node }
  | { kind: "member"; obj: Node; name: string }
  | { kind: "index"; obj: Node; index: Node }
  | { kind: "call"; callee: Node; args: Node[] };

// Binary precedence; ** is right-associative.
const BIN_PREC: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2, "**": 3 };

class Parser {
  private pos = 0;
  constructor(private readonly tokens: Token[]) {}

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }
  private next(): Token {
    const t = this.tokens[this.pos++];
    if (!t) throw new Error("Unexpected end of expression.");
    return t;
  }
  private expectPunc(value: string): void {
    const t = this.next();
    if (t.type !== "punc" || t.value !== value) {
      throw new Error(`Expected "${value}" but found "${String(t.value)}".`);
    }
  }
  private isPunc(value: string): boolean {
    const t = this.peek();
    return !!t && t.type === "punc" && t.value === value;
  }

  parse(): Node {
    const node = this.parseExpression(0);
    if (this.pos !== this.tokens.length) {
      throw new Error("Unexpected trailing tokens in expression.");
    }
    return node;
  }

  private parseExpression(minPrec: number): Node {
    let left = this.parseUnary();
    while (true) {
      const t = this.peek();
      if (t?.type !== "punc" || !(t.value in BIN_PREC)) break;
      const prec = BIN_PREC[t.value];
      if (prec < minPrec) break;
      this.next();
      const rightAssoc = t.value === "**";
      const right = this.parseExpression(rightAssoc ? prec : prec + 1);
      left = { kind: "binary", op: t.value, left, right };
    }
    return left;
  }

  private parseUnary(): Node {
    if (this.isPunc("-") || this.isPunc("+")) {
      const op = this.next() as { type: "punc"; value: string };
      return { kind: "unary", op: op.value, arg: this.parseUnary() };
    }
    return this.parsePostfix();
  }

  private parsePostfix(): Node {
    let node = this.parsePrimary();
    while (true) {
      if (this.isPunc(".")) {
        this.next();
        const name = this.next();
        if (name.type !== "id") throw new Error("Expected property name after '.'.");
        node = { kind: "member", obj: node, name: name.value };
      } else if (this.isPunc("(")) {
        this.next();
        node = { kind: "call", callee: node, args: this.parseList(")") };
      } else if (this.isPunc("[")) {
        this.next();
        const index = this.parseExpression(0);
        this.expectPunc("]");
        node = { kind: "index", obj: node, index };
      } else {
        break;
      }
    }
    return node;
  }

  private parseList(close: string): Node[] {
    const items: Node[] = [];
    if (this.isPunc(close)) {
      this.next();
      return items;
    }
    while (true) {
      items.push(this.parseExpression(0));
      if (this.isPunc(",")) {
        this.next();
        continue;
      }
      this.expectPunc(close);
      break;
    }
    return items;
  }

  private parsePrimary(): Node {
    const t = this.next();
    if (t.type === "num") return { kind: "num", value: t.value };
    if (t.type === "id") return { kind: "id", name: t.value };
    if (t.type === "punc" && t.value === "(") {
      const node = this.parseExpression(0);
      this.expectPunc(")");
      return node;
    }
    if (t.type === "punc" && t.value === "[") {
      return { kind: "array", items: this.parseList("]") };
    }
    throw new Error(`Unexpected token "${String(t.value)}".`);
  }
}

function resolveName(name: string): unknown {
  if (name in CONSTANTS) return CONSTANTS[name];
  if (ALLOWED_NAMES.has(name)) return NP[name];
  throw new Error(`Unknown name "${name}" — only numpy-ts functions are available.`);
}

const BINARY_UFUNC: Record<string, string> = {
  "+": "add",
  "-": "subtract",
  "*": "multiply",
  "/": "divide",
  "%": "mod",
  "**": "power",
};

function isNumber(x: unknown): x is number {
  return typeof x === "number";
}

function evalNode(node: Node): unknown {
  switch (node.kind) {
    case "num":
      return node.value;
    case "id":
      return resolveName(node.name);
    case "array":
      return node.items.map(evalNode);
    case "unary": {
      const arg = evalNode(node.arg);
      if (isNumber(arg)) return node.op === "-" ? -arg : arg;
      // Negating an array → numpy's `negative`.
      if (node.op === "-") return (NP.negative as (a: unknown) => unknown)(arg);
      return arg;
    }
    case "binary": {
      const left = evalNode(node.left);
      const right = evalNode(node.right);
      if (isNumber(left) && isNumber(right)) {
        switch (node.op) {
          case "+":
            return left + right;
          case "-":
            return left - right;
          case "*":
            return left * right;
          case "/":
            return left / right;
          case "%":
            return left % right;
          case "**":
            return left ** right;
        }
      }
      // Array operand(s) → dispatch to the corresponding numpy ufunc.
      const fn = NP[BINARY_UFUNC[node.op]] as (a: unknown, b: unknown) => unknown;
      return fn(left, right);
    }
    case "member": {
      if (BLOCKED_PROPS.has(node.name)) {
        throw new Error(`Access to "${node.name}" is not allowed.`);
      }
      const obj = evalNode(node.obj);
      if (obj == null) throw new Error("Cannot read a property of null/undefined.");
      return (obj as Record<string, unknown>)[node.name];
    }
    case "index": {
      const obj = evalNode(node.obj);
      const index = evalNode(node.index);
      if (!isNumber(index)) throw new Error("Only numeric indexing is supported.");
      if (obj == null) throw new Error("Cannot index null/undefined.");
      return (obj as Record<number, unknown>)[index];
    }
    case "call": {
      const args = node.args.map(evalNode);
      if (node.callee.kind === "member") {
        if (BLOCKED_PROPS.has(node.callee.name)) {
          throw new Error(`Access to "${node.callee.name}" is not allowed.`);
        }
        const thisArg = evalNode(node.callee.obj);
        const fn = (thisArg as Record<string, unknown>)?.[node.callee.name];
        if (typeof fn !== "function") {
          throw new Error(`"${node.callee.name}" is not a function.`);
        }
        return (fn as (...a: unknown[]) => unknown).apply(thisArg, args);
      }
      const fn = evalNode(node.callee);
      if (typeof fn !== "function") throw new Error("Attempted to call a non-function.");
      return (fn as (...a: unknown[]) => unknown)(...args);
    }
  }
}

/** Convert numpy return values (NDArray, Complex, nested) to plain JSON. */
export function toSerializable(x: unknown): CalcValue {
  if (x === null || x === undefined) return null;
  const t = typeof x;
  if (t === "number" || t === "string" || t === "boolean") return x as CalcValue;
  if (t === "bigint") return Number(x);
  if (t === "function" || t === "symbol") return String(x);
  const obj = x as { tolist?: () => unknown; re?: unknown; im?: unknown };
  if (typeof obj.tolist === "function") return toSerializable(obj.tolist());
  if (typeof obj.re === "number" && typeof obj.im === "number") {
    return { re: obj.re, im: obj.im };
  }
  if (Array.isArray(x)) return x.map(toSerializable);
  const proto = Object.getPrototypeOf(x);
  if (proto === Object.prototype || proto === null) {
    const out: Record<string, CalcValue> = {};
    for (const [k, v] of Object.entries(x as Record<string, unknown>)) {
      out[k] = toSerializable(v);
    }
    return out;
  }
  return String(x);
}

function formatValue(v: CalcValue): string {
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return JSON.stringify(v);
}

/** Parse and evaluate a numpy-ts expression, returning a serialized result. */
export function evaluateExpression(expression: string): CalcResult {
  const expr = expression.trim();
  if (!expr) throw new Error("`expression` must be a non-empty numpy-ts expression.");
  if (expr.length > MAX_EXPRESSION_LENGTH) {
    throw new Error(`\`expression\` is too long (max ${MAX_EXPRESSION_LENGTH} characters).`);
  }
  let raw: unknown;
  try {
    const ast = new Parser(tokenize(expr)).parse();
    raw = evalNode(ast);
  } catch (err) {
    throw new Error(
      `Could not evaluate "${expr}": ${err instanceof Error ? err.message : String(err)}`
    );
  }
  const result = toSerializable(raw);
  return { formatted: `${expr} = ${formatValue(result)}`, result };
}
