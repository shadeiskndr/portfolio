"use client";

import { type AnyFieldApi, useForm } from "@tanstack/react-form";
import { useCallback, useState } from "react";
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

const formSelector = (s: { canSubmit: boolean; isValid: boolean; values: Model }) => ({
  canSubmit: s.canSubmit,
  isValid: s.isValid,
  values: s.values,
});

function TextInput({ field, label }: { field: AnyFieldApi; label: string }) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value),
    [field]
  );

  return (
    <input
      value={field.state.value}
      onChange={handleChange}
      onBlur={field.handleBlur}
      placeholder="label"
      className={inputClass}
      aria-label={label}
    />
  );
}

function NumberInput({ field, label }: { field: AnyFieldApi; label: string }) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const next = raw === "" ? field.state.value : Number(raw);
      if (Number.isNaN(next)) return;
      field.handleChange(next);
    },
    [field]
  );

  return (
    <input
      type="number"
      value={field.state.value}
      onChange={handleChange}
      onBlur={field.handleBlur}
      className={inputClass}
      aria-label={label}
    />
  );
}

function AddItemButton({ onAdd }: { onAdd: (item: Item) => void }) {
  const handleClick = useCallback(() => onAdd(nextItem()), [onAdd]);

  return (
    <Button type="button" size="sm" variant="outline" onClick={handleClick}>
      + Add item
    </Button>
  );
}

function RemoveItemButton({
  index,
  onRemove,
}: {
  index: number;
  onRemove: (index: number) => void;
}) {
  const handleClick = useCallback(() => onRemove(index), [onRemove, index]);

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={handleClick}
      aria-label={`Remove item ${index + 1}`}
    >
      ×
    </Button>
  );
}

function FieldError({ errors, isTouched }: { errors: unknown[]; isTouched: boolean }) {
  if (!isTouched || errors.length === 0) return null;
  return <p className="mt-1 text-red-600 text-xs dark:text-red-400">{String(errors[0])}</p>;
}

export function NestedFormDemo() {
  const [savedCount, setSavedCount] = useState(0);

  const form = useForm({
    defaultValues: INITIAL,
    onSubmit: () => {
      setSavedCount((n) => n + 1);
    },
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    },
    [form]
  );

  return (
    <div className="my-6 rounded-xl border p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
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
              <TextInput field={field} label="Set name" />
              <FieldError errors={field.state.meta.errors} isTouched={field.state.meta.isTouched} />
            </div>
          )}
        </form.Field>

        <form.Field name="items">
          {(itemsField) => (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Items
                </span>
                <AddItemButton onAdd={itemsField.pushValue} />
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
                        <TextInput field={f} label={`Item ${i + 1} label`} />
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
                        <NumberInput field={f} label={`Item ${i + 1} weight`} />
                        <FieldError
                          errors={f.state.meta.errors}
                          isTouched={f.state.meta.isTouched}
                        />
                      </div>
                    )}
                  </form.Field>
                  <RemoveItemButton index={i} onRemove={itemsField.removeValue} />
                </div>
              ))}
            </div>
          )}
        </form.Field>

        <form.Subscribe selector={formSelector}>
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
