import { z } from "zod";

export const roleSchema = z.object({
  title: z.string(),
  period: z.string(),
  bullets: z.array(z.string()),
});

export const experienceSchema = z.object({
  firm: z.string(),
  location: z.string(),
  roles: z.array(roleSchema).min(1),
});

export const educationSchema = z.object({
  degree: z.string(),
  period: z.string(),
  institution: z.string(),
  location: z.string().default(""),
});

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
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
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
