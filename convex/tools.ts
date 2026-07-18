import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { type CalcResult, runCalculation } from "../lib/chat/calculator";
import { evaluateExpression } from "../lib/chat/np-eval";

// react-doctor-disable-next-line react-doctor/agent-tool-capability-risk
export const calculate = createTool({
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
  inputSchema: z.object({
    operation: z
      .enum([
        "sum",
        "mean",
        "median",
        "std",
        "var",
        "min",
        "max",
        "prod",
        "add",
        "subtract",
        "multiply",
        "divide",
        "power",
        "dot",
      ])
      .optional(),
    values: z.array(z.number()).optional(),
    operand: z.array(z.number()).optional(),
    expression: z.string().optional(),
  }),
  execute: async (_ctx, input): Promise<CalcResult> => {
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
