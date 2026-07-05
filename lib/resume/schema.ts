import { z } from "zod";

// The shared résumé data model. This is the single source of truth: the builder
// form binds to it, and `generate.ts` turns it into a Typst document. Kept
// deliberately flat and string-heavy so every field maps to one form input.

/** One position held at an employer. An employer may hold several (see Koo Chin Nam). */
export const roleSchema = z.object({
  title: z.string(),
  /** Free-text date span, e.g. "March 2023 – Present". Rendered verbatim. */
  period: z.string(),
  bullets: z.array(z.string()),
});

export const experienceSchema = z.object({
  firm: z.string(),
  /** City/country shown on the firm or role line depending on role count. */
  location: z.string(),
  roles: z.array(roleSchema).min(1),
});

export const educationSchema = z.object({
  degree: z.string(),
  period: z.string(),
  institution: z.string(),
  /** Optional — the Foundation entry carries none. */
  location: z.string().default(""),
});

/** A labelled row in "Systems & Technical Proficiency" (label bold, value plain). */
export const systemGroupSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const referenceSchema = z.object({
  name: z.string(),
  role: z.string(),
  phone: z.string(),
  email: z.string(),
});

export const resumeSchema = z.object({
  // Heading
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  // Body sections
  summary: z.string(),
  competencies: z.array(z.string()),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  systems: z.array(systemGroupSchema),
  references: z.array(referenceSchema),
});

export type Role = z.infer<typeof roleSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type SystemGroup = z.infer<typeof systemGroupSchema>;
export type Reference = z.infer<typeof referenceSchema>;
export type ResumeData = z.infer<typeof resumeSchema>;
