import { v } from "convex/values";
import { CHAT_MODELS, type ChatModel, DEFAULT_MODEL_ID } from "../lib/chat/models";
import type { Doc } from "./_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";

export function toChatModel(row: Doc<"chatModels">): ChatModel {
  return {
    id: row.modelId,
    name: row.name,
    provider: row.provider,
    contextTokens: row.contextTokens,
    pricing: row.pricing,
    surface: row.surface ?? "mantle",
    api: row.api,
    supportsReasoning: row.supportsReasoning ?? true,
  };
}

export async function listModels(ctx: QueryCtx | MutationCtx): Promise<Doc<"chatModels">[]> {
  return await ctx.db.query("chatModels").withIndex("by_order").collect();
}

export async function defaultModelRow(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"chatModels"> | null> {
  const rows = await listModels(ctx);
  return rows.find((r) => r.isDefault) ?? rows[0] ?? null;
}

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

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    let inserted = 0;
    for (let i = 0; i < CHAT_MODELS.length; i++) {
      const model = CHAT_MODELS[i];
      // react-doctor-disable-next-line react-doctor/async-await-in-loop
      const existing = await ctx.db
        .query("chatModels")
        .withIndex("by_modelId", (q) => q.eq("modelId", model.id))
        .unique();
      if (existing) {
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
