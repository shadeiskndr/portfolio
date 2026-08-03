"use client";

import { useForm } from "@tanstack/react-form";
import { DEFAULT_RESUME } from "@/lib/resume/default-data";

export function useResumeForm() {
  return useForm({ defaultValues: DEFAULT_RESUME });
}

export type ResumeForm = ReturnType<typeof useResumeForm>;
