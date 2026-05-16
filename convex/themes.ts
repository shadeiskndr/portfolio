import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalMutation, query } from "./_generated/server";

export type ThemeCSSVars = Record<string, string>;

export type RemoteThemeOption = {
  id: string;
  label: string;
  source: "tweakcn";
  cssVars: {
    light: ThemeCSSVars;
    dark: ThemeCSSVars;
  };
};

type TweakcnItem = {
  name: string;
  title?: string;
  type: string;
  cssVars?: {
    theme?: Record<string, string>;
    light?: Record<string, string>;
    dark?: Record<string, string>;
  };
};

type TweakcnRegistry = {
  items?: TweakcnItem[];
};

const REGISTRY_URL = "https://tweakcn.com/r/themes/registry.json";
const VALID_CSS_VAR_NAME = /^[a-z0-9-]+$/i;
const STORE_KEY = "registry";

function sanitize(input: Record<string, string> | undefined): ThemeCSSVars {
  if (!input) return {};
  const out: ThemeCSSVars = {};
  for (const [k, val] of Object.entries(input)) {
    if (typeof val === "string" && val.trim() && VALID_CSS_VAR_NAME.test(k)) {
      out[k] = val.trim();
    }
  }
  return out;
}

function normalize(items: TweakcnItem[]): RemoteThemeOption[] {
  return items
    .filter((item) => item.type === "registry:style" && item.cssVars)
    .map((item): RemoteThemeOption => {
      const theme = sanitize(item.cssVars?.theme);
      return {
        id: item.name,
        label: item.title ?? item.name,
        source: "tweakcn",
        cssVars: {
          light: { ...theme, ...sanitize(item.cssVars?.light) },
          dark: { ...theme, ...sanitize(item.cssVars?.dark) },
        },
      };
    })
    .filter((t) => Object.keys(t.cssVars.light).length > 0)
    .sort((a, b) => a.label.localeCompare(b.label));
}

export const refreshTweakcnThemes = internalAction({
  args: {},
  handler: async (ctx) => {
    const res = await fetch(REGISTRY_URL);
    if (!res.ok) {
      throw new Error(`tweakcn registry fetch ${res.status}`);
    }
    const data = (await res.json()) as TweakcnRegistry;
    const items = Array.isArray(data.items) ? data.items : [];
    const themes = normalize(items);
    await ctx.runMutation(internal.themes.upsertTweakcnThemes, {
      payload: JSON.stringify(themes),
    });
  },
});

export const upsertTweakcnThemes = internalMutation({
  args: { payload: v.string() },
  handler: async (ctx, { payload }) => {
    const existing = await ctx.db
      .query("tweakcnThemes")
      .withIndex("by_key", (q) => q.eq("key", STORE_KEY))
      .unique();
    const fields = { key: STORE_KEY, payload, fetchedAt: Date.now() };
    if (existing) {
      await ctx.db.replace(existing._id, fields);
    } else {
      await ctx.db.insert("tweakcnThemes", fields);
    }
  },
});

export const getTweakcnThemes = query({
  args: {},
  handler: async (ctx): Promise<RemoteThemeOption[]> => {
    const row = await ctx.db
      .query("tweakcnThemes")
      .withIndex("by_key", (q) => q.eq("key", STORE_KEY))
      .unique();
    if (!row) return [];
    try {
      return JSON.parse(row.payload) as RemoteThemeOption[];
    } catch {
      return [];
    }
  },
});
