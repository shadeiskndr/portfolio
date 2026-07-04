"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Item = { id: string; label: string; weight: number };
type Model = { name: string; items: Item[] };

const INITIAL: Model = {
  name: "Baseline set",
  items: [
    { id: "item-a", label: "Alpha", weight: 40 },
    { id: "item-b", label: "Beta", weight: 60 },
  ],
};

let idCounter = 0;
const nextItem = (): Item => ({ id: `item-${idCounter++}`, label: "", weight: 0 });

const inputClass =
  "w-full rounded-md border bg-transparent px-2 py-1 text-sm outline-none focus:border-primary";

function FieldError({ errors, isTouched }: { errors: unknown[]; isTouched: boolean }) {
  if (!isTouched || errors.length === 0) return null;
  return <p className="mt-1 text-red-600 text-xs dark:text-red-400">{String(errors[0])}</p>;
}

/**
 * The nested-forms shape from the post, built with TanStack Form (a real React
 * form library) since the portfolio isn't Angular. One form built once; an
 * array of item sub-forms that flex as you add/remove rows (the applyEach
 * analog); per-field validity rolling up to a single Save gate.
 */
export function NestedFormDemo() {
  const [savedCount, setSavedCount] = useState(0);

  const form = useForm({
    defaultValues: INITIAL,
    onSubmit: () => {
      setSavedCount((n) => n + 1);
    },
  });

  return (
    <div className="my-6 rounded-xl border p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        {/* Top-level field. */}
        <form.Field
          name="name"
          validators={{
            onMount: ({ value }) => (value.trim() ? undefined : "Name is required"),
            onChange: ({ value }) => (value.trim() ? undefined : "Name is required"),
          }}
        >
          {(field) => (
            <div>
              <span className="mb-1 block font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Set name
              </span>
              <input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className={inputClass}
                aria-label="Set name"
              />
              <FieldError errors={field.state.meta.errors} isTouched={field.state.meta.isTouched} />
            </div>
          )}
        </form.Field>

        {/* Nested array of item sub-forms — the applyEach analog. */}
        <form.Field name="items">
          {(itemsField) => (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Items
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => itemsField.pushValue(nextItem())}
                >
                  + Add item
                </Button>
              </div>
              {itemsField.state.value.map((item, i) => (
                <div key={item.id} className="flex items-start gap-2 rounded-lg border p-3">
                  <form.Field
                    name={`items[${i}].label`}
                    validators={{
                      onMount: ({ value }) => (value.trim() ? undefined : "Label required"),
                      onChange: ({ value }) => (value.trim() ? undefined : "Label required"),
                    }}
                  >
                    {(f) => (
                      <div className="flex-1">
                        <input
                          value={f.state.value}
                          onChange={(e) => f.handleChange(e.target.value)}
                          onBlur={f.handleBlur}
                          placeholder="label"
                          className={inputClass}
                          aria-label={`Item ${i + 1} label`}
                        />
                        <FieldError
                          errors={f.state.meta.errors}
                          isTouched={f.state.meta.isTouched}
                        />
                      </div>
                    )}
                  </form.Field>
                  <form.Field
                    name={`items[${i}].weight`}
                    validators={{
                      onMount: ({ value }) =>
                        typeof value === "number" && value >= 0 && value <= 100
                          ? undefined
                          : "0–100",
                      onChange: ({ value }) =>
                        typeof value === "number" && value >= 0 && value <= 100
                          ? undefined
                          : "0–100",
                    }}
                  >
                    {(f) => (
                      <div className="w-24">
                        <input
                          type="number"
                          value={f.state.value}
                          onChange={(e) => {
                            const raw = e.target.value;
                            // Guard the parse: keep the current weight when the
                            // field is cleared and ignore partial input (NaN),
                            // rather than storing 0/NaN into the model.
                            const next = raw === "" ? f.state.value : Number(raw);
                            if (Number.isNaN(next)) return;
                            f.handleChange(next);
                          }}
                          onBlur={f.handleBlur}
                          className={inputClass}
                          aria-label={`Item ${i + 1} weight`}
                        />
                        <FieldError
                          errors={f.state.meta.errors}
                          isTouched={f.state.meta.isTouched}
                        />
                      </div>
                    )}
                  </form.Field>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => itemsField.removeValue(i)}
                    aria-label={`Remove item ${i + 1}`}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </form.Field>

        {/* Aggregate validity + the live model, the form's one source of truth. */}
        <form.Subscribe
          selector={(s) => ({ canSubmit: s.canSubmit, isValid: s.isValid, values: s.values })}
        >
          {({ canSubmit, isValid, values }) => (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Button type="submit" size="sm" disabled={!canSubmit}>
                  Save
                </Button>
                <span
                  className={cn(
                    "font-mono text-xs",
                    isValid
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  form {isValid ? "valid" : "invalid"}
                </span>
                {savedCount > 0 ? (
                  <span className="text-muted-foreground text-xs">saved {savedCount}×</span>
                ) : null}
              </div>
              <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 font-mono text-muted-foreground text-xs">
                {JSON.stringify(values, null, 2)}
              </pre>
            </div>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
