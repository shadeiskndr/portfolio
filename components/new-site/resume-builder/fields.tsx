"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Presentational field wrappers. They take the loose `AnyFieldApi` from a
// `form.Field` render prop so no form generics have to cross a component
// boundary — the typed `form` stays in the builder that owns it.

const LABEL = "font-medium text-muted-foreground text-xs";

export function TextField({
  field,
  label,
  placeholder,
  className,
}: {
  field: AnyFieldApi;
  label?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <Field className={className}>
      {label ? (
        <FieldLabel className={LABEL} htmlFor={field.name}>
          {label}
        </FieldLabel>
      ) : null}
      <Input
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        value={field.state.value ?? ""}
      />
    </Field>
  );
}

export function TextAreaField({
  field,
  label,
  placeholder,
  rows,
  className,
}: {
  field: AnyFieldApi;
  label?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <Field className={className}>
      {label ? (
        <FieldLabel className={LABEL} htmlFor={field.name}>
          {label}
        </FieldLabel>
      ) : null}
      <Textarea
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        value={field.state.value ?? ""}
      />
    </Field>
  );
}

/** A titled card wrapping one array item, with reorder + remove controls. */
export function ItemCard({
  title,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  children,
}: {
  title: string;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-foreground/10 bg-background p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="truncate font-medium text-muted-foreground text-xs uppercase tracking-wide">
          {title}
        </span>
        <div className="flex shrink-0 items-center gap-0.5">
          {onMoveUp ? (
            <IconBtn aria-label="Move up" disabled={!canMoveUp} onClick={onMoveUp}>
              <ChevronUp className="size-3.5" />
            </IconBtn>
          ) : null}
          {onMoveDown ? (
            <IconBtn aria-label="Move down" disabled={!canMoveDown} onClick={onMoveDown}>
              <ChevronDown className="size-3.5" />
            </IconBtn>
          ) : null}
          <IconBtn
            aria-label="Remove"
            className="text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="size-3.5" />
          </IconBtn>
        </div>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function IconBtn({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "rounded p-1 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30",
        className
      )}
      type="button"
      {...props}
    />
  );
}

export function RemoveButton({
  onClick,
  label = "Remove",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <IconBtn
      aria-label={label}
      className="text-muted-foreground hover:text-destructive"
      onClick={onClick}
    >
      <Trash2 className="size-3.5" />
    </IconBtn>
  );
}

export function AddButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      className="w-full border-dashed"
      onClick={onClick}
      size="sm"
      type="button"
      variant="outline"
    >
      <Plus className="size-3.5" />
      {children}
    </Button>
  );
}
