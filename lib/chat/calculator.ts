import {
  add,
  amax,
  amin,
  array,
  divide,
  dot,
  mean,
  median,
  multiply,
  power,
  prod,
  std,
  subtract,
  sum,
  variance,
} from "numpy-ts/core";

/** A JSON-serializable value — the subset of Convex `Value` a tool returns. */
export type CalcValue =
  | number
  | string
  | boolean
  | null
  | CalcValue[]
  | { [key: string]: CalcValue };

export type CalcResult = {
  /** Human-readable rendering, e.g. `mean([4, 8, 15]) = 9`. */
  formatted: string;
  /** Scalar for reductions/dot, list for element-wise, or arbitrary for expressions. */
  result: CalcValue;
};

type NDArray = ReturnType<typeof array>;
type Reducer = (a: NDArray) => unknown;
type Binary = (x1: NDArray, x2: NDArray) => { tolist: () => unknown };

// Operations that reduce a single `values` list to one number.
const REDUCTIONS: Record<string, Reducer> = {
  sum,
  mean,
  median,
  std,
  var: variance,
  min: amin,
  max: amax,
  prod,
};

// Element-wise operations between `values` and `operand`. NumPy broadcasts a
// length-1 `operand` across every element of `values`.
const ELEMENTWISE: Record<string, Binary> = {
  add,
  subtract,
  multiply,
  divide,
  power,
};

const SYMBOLS: Record<string, string> = {
  add: "+",
  subtract: "-",
  multiply: "×",
  divide: "÷",
  power: "^",
};

/** Coerce numpy's scalar returns (number | bigint | Complex | 0-d array) to a number. */
export function toScalar(x: unknown): number {
  if (typeof x === "number") return x;
  if (typeof x === "bigint") return Number(x);
  if (x !== null && typeof x === "object") {
    const o = x as { tolist?: () => unknown; re?: number };
    if (typeof o.tolist === "function") return toScalar(o.tolist());
    if (typeof o.re === "number") return o.re;
  }
  return Number(x);
}

function list(xs: number[]): string {
  return `[${xs.join(", ")}]`;
}

/**
 * Evaluate one curated calculator operation with numpy-ts. Throws on malformed
 * input so the agent surfaces the reason as a tool error and can correct itself.
 */
export function runCalculation(
  operation: string,
  values: number[],
  operand?: number[]
): CalcResult {
  if (values.length === 0) {
    throw new Error("`values` must contain at least one number.");
  }

  const reducer = REDUCTIONS[operation];
  if (reducer) {
    const result = toScalar(reducer(array(values)));
    return { formatted: `${operation}(${list(values)}) = ${result}`, result };
  }

  if (!operand || operand.length === 0) {
    throw new Error(`Operation "${operation}" requires a non-empty \`operand\` list.`);
  }

  if (operation === "dot") {
    if (values.length !== operand.length) {
      throw new Error(
        `dot requires equal-length lists (got ${values.length} and ${operand.length}).`
      );
    }
    const result = toScalar(dot(array(values), array(operand)));
    return { formatted: `${list(values)} · ${list(operand)} = ${result}`, result };
  }

  const binary = ELEMENTWISE[operation];
  if (!binary) {
    throw new Error(`Unknown operation: "${operation}".`);
  }
  if (operand.length !== 1 && operand.length !== values.length) {
    throw new Error(
      `Element-wise "${operation}" needs \`operand\` of length 1 or ${values.length} (got ${operand.length}).`
    );
  }
  const result = (binary(array(values), array(operand)).tolist() as unknown[]).map(toScalar);
  return {
    formatted: `${list(values)} ${SYMBOLS[operation]} ${list(operand)} = ${list(result)}`,
    result,
  };
}
