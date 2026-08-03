import type { ResumeEdit } from "@/convex/resumeChat";
import type { ResumeData } from "./schema";

export function applyResumeEdits(
  data: ResumeData,
  edits: ResumeEdit[]
): { draft: ResumeData; applied: number } {
  const draft = structuredClone(data);
  let applied = 0;

  const deleteEmployers = new Set<number>();
  const deleteRoles = new Map<number, Set<number>>();
  const deleteEducation = new Set<number>();
  const deleteSystems = new Set<number>();
  const deleteReferences = new Set<number>();
  const markRole = (emp: number, role: number) => {
    const set = deleteRoles.get(emp) ?? new Set<number>();
    set.add(role);
    deleteRoles.set(emp, set);
  };

  for (const edit of edits) {
    switch (edit.type) {
      case "summary":
        draft.summary = edit.text;
        applied++;
        break;
      case "competencies":
        draft.competencies = edit.items;
        applied++;
        break;
      case "contact":
        if (edit.name !== undefined) draft.name = edit.name;
        if (edit.email !== undefined) draft.email = edit.email;
        if (edit.phone !== undefined) draft.phone = edit.phone;
        if (edit.location !== undefined) draft.location = edit.location;
        applied++;
        break;
      case "bullets": {
        const role = draft.experience[edit.employerIndex]?.roles[edit.roleIndex];
        if (role) {
          role.bullets = edit.bullets;
          applied++;
        }
        break;
      }
      case "update_employer": {
        const emp = draft.experience[edit.employerIndex];
        if (emp) {
          if (edit.firm !== undefined) emp.firm = edit.firm;
          if (edit.location !== undefined) emp.location = edit.location;
          applied++;
        }
        break;
      }
      case "update_role": {
        const role = draft.experience[edit.employerIndex]?.roles[edit.roleIndex];
        if (role) {
          if (edit.title !== undefined) role.title = edit.title;
          if (edit.period !== undefined) role.period = edit.period;
          applied++;
        }
        break;
      }
      case "update_education": {
        const ed = draft.education[edit.index];
        if (ed) {
          if (edit.degree !== undefined) ed.degree = edit.degree;
          if (edit.institution !== undefined) ed.institution = edit.institution;
          if (edit.period !== undefined) ed.period = edit.period;
          if (edit.location !== undefined) ed.location = edit.location;
          applied++;
        }
        break;
      }
      case "update_system": {
        const s = draft.systems[edit.index];
        if (s) {
          if (edit.label !== undefined) s.label = edit.label;
          if (edit.value !== undefined) s.value = edit.value;
          applied++;
        }
        break;
      }
      case "update_reference": {
        const ref = draft.references[edit.index];
        if (ref) {
          if (edit.name !== undefined) ref.name = edit.name;
          if (edit.role !== undefined) ref.role = edit.role;
          if (edit.phone !== undefined) ref.phone = edit.phone;
          if (edit.email !== undefined) ref.email = edit.email;
          applied++;
        }
        break;
      }
      case "add_role": {
        const emp = draft.experience[edit.employerIndex];
        if (emp) {
          emp.roles.push({ title: edit.title, period: edit.period, bullets: edit.bullets });
          applied++;
        }
        break;
      }
      case "add_employer":
        draft.experience.push({
          firm: edit.firm,
          location: edit.location,
          roles: [{ title: edit.role.title, period: edit.role.period, bullets: edit.role.bullets }],
        });
        applied++;
        break;
      case "add_education":
        draft.education.push({
          degree: edit.degree,
          period: edit.period,
          institution: edit.institution,
          location: edit.location,
        });
        applied++;
        break;
      case "add_system":
        draft.systems.push({ label: edit.label, value: edit.value });
        applied++;
        break;
      case "add_reference":
        draft.references.push({
          name: edit.name,
          role: edit.role,
          phone: edit.phone,
          email: edit.email,
        });
        applied++;
        break;
      case "delete_employer":
        if (draft.experience[edit.employerIndex]) {
          deleteEmployers.add(edit.employerIndex);
          applied++;
        }
        break;
      case "delete_role":
        if (draft.experience[edit.employerIndex]?.roles[edit.roleIndex]) {
          markRole(edit.employerIndex, edit.roleIndex);
          applied++;
        }
        break;
      case "delete_education":
        if (draft.education[edit.index]) {
          deleteEducation.add(edit.index);
          applied++;
        }
        break;
      case "delete_system":
        if (draft.systems[edit.index]) {
          deleteSystems.add(edit.index);
          applied++;
        }
        break;
      case "delete_reference":
        if (draft.references[edit.index]) {
          deleteReferences.add(edit.index);
          applied++;
        }
        break;
    }
  }

  const nextExperience: ResumeData["experience"] = [];
  for (const [i, emp] of draft.experience.entries()) {
    if (deleteEmployers.has(i)) continue;
    const roleDeletes = deleteRoles.get(i);
    const roles = roleDeletes ? emp.roles.filter((_, j) => !roleDeletes.has(j)) : emp.roles;
    if (roles.length > 0) nextExperience.push({ ...emp, roles });
  }
  draft.experience = nextExperience;
  draft.education = draft.education.filter((_, i) => !deleteEducation.has(i));
  draft.systems = draft.systems.filter((_, i) => !deleteSystems.has(i));
  draft.references = draft.references.filter((_, i) => !deleteReferences.has(i));

  return { draft, applied };
}
