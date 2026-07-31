"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value),
    [field]
  );

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
        onChange={handleChange}
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
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => field.handleChange(e.target.value),
    [field]
  );

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
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        value={field.state.value ?? ""}
      />
    </Field>
  );
}

export function ItemCard({
  title,
  index,
  onRemove,
  onMove,
  canMoveUp,
  canMoveDown,
  children,
}: {
  title: string;
  index: number;
  onRemove: (index: number) => void;
  onMove?: (from: number, to: number) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  children: React.ReactNode;
}) {
  const handleRemove = useCallback(() => onRemove(index), [onRemove, index]);
  const handleMoveUp = useCallback(() => onMove?.(index, index - 1), [onMove, index]);
  const handleMoveDown = useCallback(() => onMove?.(index, index + 1), [onMove, index]);

  return (
    <div className="rounded-lg border border-foreground/10 bg-background p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="truncate font-medium text-muted-foreground text-xs uppercase tracking-wide">
          {title}
        </span>
        <div className="flex shrink-0 items-center gap-0.5">
          {onMove ? (
            <>
              <IconBtn aria-label="Move up" disabled={!canMoveUp} onClick={handleMoveUp}>
                <ChevronUp className="size-3.5" />
              </IconBtn>
              <IconBtn aria-label="Move down" disabled={!canMoveDown} onClick={handleMoveDown}>
                <ChevronDown className="size-3.5" />
              </IconBtn>
            </>
          ) : null}
          <IconBtn
            aria-label="Remove"
            className="text-muted-foreground hover:text-destructive"
            onClick={handleRemove}
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
  index,
  onRemove,
  label = "Remove",
}: {
  index: number;
  onRemove: (index: number) => void;
  label?: string;
}) {
  const handleClick = useCallback(() => onRemove(index), [onRemove, index]);

  return (
    <IconBtn
      aria-label={label}
      className="text-muted-foreground hover:text-destructive"
      onClick={handleClick}
    >
      <Trash2 className="size-3.5" />
    </IconBtn>
  );
}

export function AddButton<T>({
  children,
  onAdd,
  makeValue,
}: {
  children: React.ReactNode;
  onAdd: (value: T) => void;
  makeValue: () => T;
}) {
  const handleClick = useCallback(() => onAdd(makeValue()), [onAdd, makeValue]);

  return (
    <Button
      className="w-full border-dashed"
      onClick={handleClick}
      size="sm"
      type="button"
      variant="outline"
    >
      <Plus className="size-3.5" />
      {children}
    </Button>
  );
}
