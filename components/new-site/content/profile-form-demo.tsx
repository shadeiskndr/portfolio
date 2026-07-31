"use client";

import { type AnyFieldApi, useForm } from "@tanstack/react-form";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Profile = { name: string; email: string; bio: string };

const INITIAL: Profile = { name: "", email: "", bio: "" };
const BIO_MAX = 300;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "w-full rounded-md border bg-transparent px-2 py-1 text-sm outline-none focus:border-primary";

const formSelector = (s: { isValid: boolean; isDirty: boolean; values: Profile }) => ({
  isValid: s.isValid,
  isDirty: s.isDirty,
  values: s.values,
});

function TextInput({ field, label, type }: { field: AnyFieldApi; label: string; type?: string }) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value),
    [field]
  );

  return (
    <input
      type={type}
      value={field.state.value}
      onChange={handleChange}
      onBlur={field.handleBlur}
      className={inputClass}
      aria-label={label}
    />
  );
}

function TextArea({ field, label, rows }: { field: AnyFieldApi; label: string; rows: number }) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => field.handleChange(e.target.value),
    [field]
  );

  return (
    <textarea
      value={field.state.value}
      onChange={handleChange}
      onBlur={field.handleBlur}
      rows={rows}
      className={cn(inputClass, "resize-y")}
      aria-label={label}
    />
  );
}

function FieldError({ errors, isTouched }: { errors: unknown[]; isTouched: boolean }) {
  if (!isTouched || errors.length === 0) return null;
  return <p className="mt-1 text-red-600 text-xs dark:text-red-400">{String(errors[0])}</p>;
}

export function ProfileFormDemo() {
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
  const handleReset = useCallback(() => form.reset(), [form]);

  return (
    <div className="my-6 rounded-xl border p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
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
                Name
              </span>
              <TextInput field={field} label="Name" />
              <FieldError errors={field.state.meta.errors} isTouched={field.state.meta.isTouched} />
            </div>
          )}
        </form.Field>

        <form.Field
          name="email"
          validators={{
            onMount: ({ value }) =>
              !value.trim()
                ? "Email is required"
                : EMAIL.test(value)
                  ? undefined
                  : "Enter a valid email",
            onChange: ({ value }) =>
              !value.trim()
                ? "Email is required"
                : EMAIL.test(value)
                  ? undefined
                  : "Enter a valid email",
          }}
        >
          {(field) => (
            <div>
              <span className="mb-1 block font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Email
              </span>
              <TextInput field={field} label="Email" type="email" />
              <FieldError errors={field.state.meta.errors} isTouched={field.state.meta.isTouched} />
            </div>
          )}
        </form.Field>

        <form.Field
          name="bio"
          validators={{
            onChange: ({ value }) =>
              value.length > BIO_MAX ? `Keep it under ${BIO_MAX} characters` : undefined,
          }}
        >
          {(field) => (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Bio
                </span>
                <span
                  className={cn(
                    "font-mono text-xs",
                    field.state.value.length > BIO_MAX
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground"
                  )}
                >
                  {field.state.value.length}/{BIO_MAX}
                </span>
              </div>
              <TextArea field={field} label="Bio" rows={2} />
              <FieldError errors={field.state.meta.errors} isTouched={field.state.meta.isTouched} />
            </div>
          )}
        </form.Field>

        <form.Subscribe selector={formSelector}>
          {({ isValid, isDirty, values }) => (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" size="sm" disabled={!(isValid && isDirty)}>
                  Save
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={handleReset}>
                  Reset
                </Button>
                <span className="flex gap-2 font-mono text-xs">
                  <span
                    className={cn(
                      isValid
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {isValid ? "valid" : "invalid"}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{isDirty ? "dirty" : "pristine"}</span>
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
