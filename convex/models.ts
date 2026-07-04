import { v } from "convex/values";
import { CHAT_MODELS, type ChatModel, DEFAULT_MODEL_ID } from "../lib/chat/models";
import type { Doc } from "./_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";

/** Map a stored `chatModels` row to the registry/client `ChatModel` shape. */
export function toChatModel(row: Doc<"chatModels">): ChatModel {
  return {
    id: row.modelId,
    name: row.name,
    provider: row.provider,
    contextTokens: row.contextTokens,
    pricing: row.pricing,
    // Rows predating these columns read as Mantle / reasoning-capable (all the
    // originally-seeded models are).
    surface: row.surface ?? "mantle",
    api: row.api,
    supportsReasoning: row.supportsReasoning ?? true,
  };
}

/** All models in display order. */
export async function listModels(ctx: QueryCtx | MutationCtx): Promise<Doc<"chatModels">[]> {
  return await ctx.db.query("chatModels").withIndex("by_order").collect();
}

/**
 * The default row: the one flagged `isDefault`, else the first by order. Null
 * only when the table is empty (before `models:seed`), in which case callers
 * fall back to the code-level bootstrap default.
 */
export async function defaultModelRow(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"chatModels"> | null> {
  const rows = await listModels(ctx);
  return rows.find((r) => r.isDefault) ?? rows[0] ?? null;
}

/** Resolve an (untrusted) model id to a stored row, falling back to the default. */
export async function resolveModelRow(
  ctx: QueryCtx | MutationCtx,
  id: string | undefined | null
): Promise<Doc<"chatModels"> | null> {
  if (id) {
    const row = await ctx.db
      .query("chatModels")
      .withIndex("by_modelId", (q) => q.eq("modelId", id))
      .unique();
    if (row) return row;
  }
  return await defaultModelRow(ctx);
}

/**
 * Minimal model info for building a run's model. Actions can't read the DB
 * directly, so `chat.execute` resolves through this internal query.
 */
export const resolveForRun = internalQuery({
  args: { modelId: v.optional(v.string()) },
  handler: async (ctx, { modelId }) => {
    const row = await resolveModelRow(ctx, modelId);
    return row
      ? {
          id: row.modelId,
          surface: row.surface ?? "mantle",
          api: row.api,
          supportsReasoning: row.supportsReasoning ?? true,
        }
      : null;
  },
});

/**
 * Backfill the `chatModels` table from the CHAT_MODELS seed. Idempotent: inserts
 * only models not already present (never patches, so runtime edits survive),
 * then ensures a default exists. Run once after deploy: `convex run models:seed`.
 */
export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    let inserted = 0;
    // One-time idempotent seed over a static ~dozen-entry array (`order: i`
    // depends on iteration index); parallelizing this CLI-run backfill would
    // add complexity for no perf that matters.
    for (let i = 0; i < CHAT_MODELS.length; i++) {
      const model = CHAT_MODELS[i];
      // react-doctor-disable-next-line react-doctor/async-await-in-loop
      const existing = await ctx.db
        .query("chatModels")
        .withIndex("by_modelId", (q) => q.eq("modelId", model.id))
        .unique();
      if (existing) {
        // Backfill columns added after the row was seeded, without touching any
        // other (possibly owner-edited) fields.
        const backfill: { supportsReasoning?: boolean; surface?: "mantle" | "converse" } = {};
        if (existing.supportsReasoning === undefined) {
          backfill.supportsReasoning = model.supportsReasoning;
        }
        if (existing.surface === undefined) backfill.surface = model.surface;
        if (Object.keys(backfill).length > 0) await ctx.db.patch(existing._id, backfill);
        continue;
      }
      await ctx.db.insert("chatModels", {
        modelId: model.id,
        name: model.name,
        provider: model.provider,
        contextTokens: model.contextTokens,
        pricing: {
          inputPer1M: model.pricing.inputPer1M,
          outputPer1M: model.pricing.outputPer1M,
        },
        surface: model.surface,
        api: model.api,
        supportsReasoning: model.supportsReasoning,
        isDefault: model.id === DEFAULT_MODEL_ID,
        order: i,
      });
      inserted++;
    }
    const rows = await listModels(ctx);
    if (rows.length > 0 && !rows.some((r) => r.isDefault)) {
      await ctx.db.patch(rows[0]._id, { isDefault: true });
    }
    return { inserted, total: rows.length };
  },
});
