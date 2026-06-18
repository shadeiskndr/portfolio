import { defineTool } from "@convex-dev/agent";
import { v } from "convex/values";
import { type CalcResult, runCalculation } from "../lib/chat/calculator";
import { evaluateExpression } from "../lib/chat/np-eval";

/**
 * Numeric calculator backed by numpy-ts, with two input modes:
 *
 * 1. A curated `operation` over one or two number lists (validated, common cases).
 * 2. A free-form `expression` evaluated against the full numpy-ts namespace via a
 *    small safe interpreter (`lib/chat/np-eval.ts`) — no `eval`/`new Function`,
 *    only numpy-ts functions are reachable.
 */
export const calculate = defineTool({
  description:
    "Perform an exact numeric calculation with NumPy. Use this instead of doing arithmetic or " +
    "statistics yourself whenever the user asks for a computed number, matrix, or statistic.\n\n" +
    "TWO input modes — provide exactly one:\n\n" +
    "MODE 1 — `operation` + `values` (+ optional `operand`), for common cases:\n" +
    "  Reductions (use `values` only): sum, mean, median, std, var, min, max, prod.\n" +
    "  Element-wise (use `values` and `operand`; `operand` may be a single number applied to " +
    "every element): add, subtract, multiply, divide, power.\n" +
    "  Vector: dot (dot product of two equal-length lists).\n" +
    "  e.g. {operation:'mean', values:[4,8,15]} · {operation:'power', values:[3], operand:[4]}.\n\n" +
    "MODE 2 — `expression`, a numpy-ts expression string, for anything else (matrices, linear " +
    "algebra, trig, FFT, rounding, sorting, polynomials, etc.). Rules: call numpy functions by " +
    "name in FUNCTIONAL style (no `np.` prefix, no method chaining); wrap every array/matrix in " +
    "`array(...)`; wrap a lone number for math functions, e.g. `sqrt(array([2]))`; scalar " +
    "arithmetic can use the operators + - * / % ** and parentheses; string arguments are NOT " +
    "supported.\n" +
    "  e.g. `linalg.det(array([[1,2],[3,4]]))` · `linalg.inv(array([[1,2],[3,4]]))` · " +
    "`linalg.norm(array([3,4]))` · `matmul(array([[1,2],[3,4]]), array([[5,6],[7,8]]))` · " +
    "`sin(array([0, 1.57]))` · `fft.fft(array([1,2,3,4]))` · `percentile(array([1,2,3,4,5]), 50)` · " +
    "`2 ** 10`.",
  input: v.object({
    operation: v.optional(
      v.union(
        v.literal("sum"),
        v.literal("mean"),
        v.literal("median"),
        v.literal("std"),
        v.literal("var"),
        v.literal("min"),
        v.literal("max"),
        v.literal("prod"),
        v.literal("add"),
        v.literal("subtract"),
        v.literal("multiply"),
        v.literal("divide"),
        v.literal("power"),
        v.literal("dot")
      )
    ),
    values: v.optional(v.array(v.number())),
    operand: v.optional(v.array(v.number())),
    expression: v.optional(v.string()),
  }),
  output: v.object({
    formatted: v.string(),
    result: v.any(),
  }),
  execute: async (input): Promise<CalcResult> => {
    // A tool `execute` that THROWS is fatal to the whole run in the agent's V2
    // runs executor: `handleToolCall` doesn't catch it, so the throw propagates
    // to `runs.execute` → `runs.fail`, which patches the run's stream doc and
    // races the just-recorded tool events on the same doc — surfacing as the
    // "streams table ... appendEvents" OCC write conflict. The model calls
    // `calculate` with empty/malformed input often enough that this aborts turns
    // constantly. So never throw: return the reason as a normal tool result the
    // model can read and retry from (bounded by the executor's step cap).
    try {
      if (typeof input.expression === "string" && input.expression.trim()) {
        return evaluateExpression(input.expression);
      }
      if (input.operation && input.values) {
        return runCalculation(input.operation, input.values, input.operand);
      }
      return {
        formatted:
          "Error: no calculation provided. Call `calculate` again with either an `expression` " +
          "string, or both an `operation` and a `values` list. See the tool description.",
        result: null,
      };
    } catch (error) {
      return {
        formatted: `Error: ${error instanceof Error ? error.message : String(error)}`,
        result: null,
      };
    }
  },
});
