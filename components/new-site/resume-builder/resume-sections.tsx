"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { ResumeData } from "@/lib/resume/schema";
import { AddButton, ItemCard, RemoveButton, TextAreaField, TextField } from "./fields";
import { useArrayKeys } from "./use-array-keys";
import type { ResumeForm } from "./use-resume-form";

type Experience = ResumeData["experience"];
type Role = Experience[number]["roles"][number];

const emptyString = () => "";
const emptyRole = (): Role => ({ title: "", period: "", bullets: [""] });
const emptyExperience = (): Experience[number] => ({
  firm: "",
  location: "",
  roles: [emptyRole()],
});
const emptyEducation = () => ({ degree: "", period: "", institution: "", location: "" });
const emptySystem = () => ({ label: "", value: "" });
const emptyReference = () => ({ name: "", role: "", phone: "", email: "" });

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="border-foreground/10 border-b pb-1 font-serif text-foreground text-sm">
        {title}
      </h2>
      {children}
    </section>
  );
}

function RemoveRoleButton({
  index,
  onRemove,
}: {
  index: number;
  onRemove: (index: number) => void;
}) {
  const handleClick = useCallback(() => onRemove(index), [onRemove, index]);

  return (
    <Button
      className="self-start text-muted-foreground text-xs"
      onClick={handleClick}
      size="sm"
      type="button"
      variant="ghost"
    >
      Remove role
    </Button>
  );
}

function useKeyedList(
  length: number,
  removeValue: (index: number) => void,
  moveValue?: (from: number, to: number) => void
) {
  const { keys, removeKey, moveKey } = useArrayKeys(length);

  const handleRemove = useCallback(
    (index: number) => {
      removeKey(index);
      removeValue(index);
    },
    [removeKey, removeValue]
  );

  const handleMove = useCallback(
    (from: number, to: number) => {
      moveKey(from, to);
      moveValue?.(from, to);
    },
    [moveKey, moveValue]
  );

  return { keys, handleRemove, handleMove };
}

export function HeadingSection({ form }: { form: ResumeForm }) {
  return (
    <Section title="Heading">
      <form.Field name="name">
        {(f) => <TextField field={f} label="Full name" placeholder="Jane Doe" />}
      </form.Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <form.Field name="email">
          {(f) => <TextField field={f} label="Email" placeholder="jane@example.com" />}
        </form.Field>
        <form.Field name="phone">
          {(f) => <TextField field={f} label="Phone" placeholder="+60 12-345 6789" />}
        </form.Field>
      </div>
      <form.Field name="location">
        {(f) => <TextField field={f} label="Location" placeholder="City, Country" />}
      </form.Field>
    </Section>
  );
}

export function SummarySection({ form }: { form: ResumeForm }) {
  return (
    <Section title="Professional Summary">
      <form.Field name="summary">{(f) => <TextAreaField field={f} rows={6} />}</form.Field>
    </Section>
  );
}

function CompetencyRows({
  form,
  onPush,
  onRemove,
  values,
}: {
  form: ResumeForm;
  onPush: (value: string) => void;
  onRemove: (index: number) => void;
  values: string[];
}) {
  const { keys, handleRemove } = useKeyedList(values.length, onRemove);

  return (
    <div className="flex flex-col gap-2">
      {values.map((_, i) => (
        <div className="flex items-center gap-1.5" key={keys[i]}>
          <form.Field name={`competencies[${i}]`}>
            {(f) => <TextField className="flex-1" field={f} />}
          </form.Field>
          <RemoveButton index={i} onRemove={handleRemove} />
        </div>
      ))}
      <AddButton makeValue={emptyString} onAdd={onPush}>
        Add competency
      </AddButton>
    </div>
  );
}

export function CompetenciesSection({ form }: { form: ResumeForm }) {
  return (
    <Section title="Core Competencies">
      <form.Field mode="array" name="competencies">
        {(arr) => (
          <CompetencyRows
            form={form}
            onPush={arr.pushValue}
            onRemove={arr.removeValue}
            values={arr.state.value as string[]}
          />
        )}
      </form.Field>
    </Section>
  );
}

function BulletRows({
  form,
  employerIndex,
  onPush,
  onRemove,
  roleIndex,
  values,
}: {
  form: ResumeForm;
  employerIndex: number;
  onPush: (value: string) => void;
  onRemove: (index: number) => void;
  roleIndex: number;
  values: string[];
}) {
  const { keys, handleRemove } = useKeyedList(values.length, onRemove);

  return (
    <div className="flex flex-col gap-2">
      {values.map((_, k) => (
        <div className="flex items-start gap-1.5" key={keys[k]}>
          <form.Field name={`experience[${employerIndex}].roles[${roleIndex}].bullets[${k}]`}>
            {(f) => <TextAreaField className="flex-1" field={f} rows={2} />}
          </form.Field>
          <RemoveButton label="Remove bullet" index={k} onRemove={handleRemove} />
        </div>
      ))}
      <AddButton makeValue={emptyString} onAdd={onPush}>
        Add bullet
      </AddButton>
    </div>
  );
}

function RoleFields({
  form,
  employerIndex,
  roleIndex,
}: {
  form: ResumeForm;
  employerIndex: number;
  roleIndex: number;
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <form.Field name={`experience[${employerIndex}].roles[${roleIndex}].title`}>
          {(f) => <TextField field={f} label="Role title" />}
        </form.Field>
        <form.Field name={`experience[${employerIndex}].roles[${roleIndex}].period`}>
          {(f) => <TextField field={f} label="Dates" />}
        </form.Field>
      </div>

      <form.Field mode="array" name={`experience[${employerIndex}].roles[${roleIndex}].bullets`}>
        {(bullets) => (
          <BulletRows
            employerIndex={employerIndex}
            form={form}
            onPush={bullets.pushValue}
            onRemove={bullets.removeValue}
            roleIndex={roleIndex}
            values={bullets.state.value as string[]}
          />
        )}
      </form.Field>
    </>
  );
}

function RoleRows({
  form,
  employerIndex,
  onPush,
  onRemove,
  values,
}: {
  form: ResumeForm;
  employerIndex: number;
  onPush: (value: Role) => void;
  onRemove: (index: number) => void;
  values: Role[];
}) {
  const { keys, handleRemove } = useKeyedList(values.length, onRemove);

  return (
    <div className="flex flex-col gap-3 border-foreground/10 border-l-2 pl-3">
      {values.map((_, j) => (
        <div className="flex flex-col gap-2.5" key={keys[j]}>
          <RoleFields employerIndex={employerIndex} form={form} roleIndex={j} />
          {values.length > 1 ? <RemoveRoleButton index={j} onRemove={handleRemove} /> : null}
        </div>
      ))}
      <AddButton makeValue={emptyRole} onAdd={onPush}>
        Add role
      </AddButton>
    </div>
  );
}

function ExperienceFields({ form, index }: { form: ResumeForm; index: number }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <form.Field name={`experience[${index}].firm`}>
          {(f) => <TextField field={f} label="Firm / company" />}
        </form.Field>
        <form.Field name={`experience[${index}].location`}>
          {(f) => <TextField field={f} label="Location" />}
        </form.Field>
      </div>

      <form.Field mode="array" name={`experience[${index}].roles`}>
        {(roles) => (
          <RoleRows
            employerIndex={index}
            form={form}
            onPush={roles.pushValue}
            onRemove={roles.removeValue}
            values={roles.state.value as Role[]}
          />
        )}
      </form.Field>
    </>
  );
}

function ExperienceRows({
  form,
  onMove,
  onPush,
  onRemove,
  values,
}: {
  form: ResumeForm;
  onMove: (from: number, to: number) => void;
  onPush: (value: Experience[number]) => void;
  onRemove: (index: number) => void;
  values: Experience;
}) {
  const { keys, handleRemove, handleMove } = useKeyedList(values.length, onRemove, onMove);

  return (
    <div className="flex flex-col gap-3">
      {values.map((_, i) => (
        <ItemCard
          canMoveDown={i < values.length - 1}
          canMoveUp={i > 0}
          index={i}
          key={keys[i]}
          onMove={handleMove}
          onRemove={handleRemove}
          title={`Employer ${i + 1}`}
        >
          <ExperienceFields form={form} index={i} />
        </ItemCard>
      ))}
      <AddButton makeValue={emptyExperience} onAdd={onPush}>
        Add employer
      </AddButton>
    </div>
  );
}

export function ExperienceSection({ form }: { form: ResumeForm }) {
  return (
    <Section title="Work Experience">
      <form.Field mode="array" name="experience">
        {(exp) => (
          <ExperienceRows
            form={form}
            onMove={exp.moveValue}
            onPush={exp.pushValue}
            onRemove={exp.removeValue}
            values={exp.state.value as Experience}
          />
        )}
      </form.Field>
    </Section>
  );
}

function EducationRows({
  form,
  onMove,
  onPush,
  onRemove,
  values,
}: {
  form: ResumeForm;
  onMove: (from: number, to: number) => void;
  onPush: (value: ResumeData["education"][number]) => void;
  onRemove: (index: number) => void;
  values: ResumeData["education"];
}) {
  const { keys, handleRemove, handleMove } = useKeyedList(values.length, onRemove, onMove);

  return (
    <div className="flex flex-col gap-3">
      {values.map((_, i) => (
        <ItemCard
          canMoveDown={i < values.length - 1}
          canMoveUp={i > 0}
          index={i}
          key={keys[i]}
          onMove={handleMove}
          onRemove={handleRemove}
          title={`Entry ${i + 1}`}
        >
          <form.Field name={`education[${i}].degree`}>
            {(f) => <TextField field={f} label="Degree / qualification" />}
          </form.Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <form.Field name={`education[${i}].institution`}>
              {(f) => <TextField field={f} label="Institution" />}
            </form.Field>
            <form.Field name={`education[${i}].period`}>
              {(f) => <TextField field={f} label="Years" />}
            </form.Field>
          </div>
          <form.Field name={`education[${i}].location`}>
            {(f) => <TextField field={f} label="Location (optional)" />}
          </form.Field>
        </ItemCard>
      ))}
      <AddButton makeValue={emptyEducation} onAdd={onPush}>
        Add education
      </AddButton>
    </div>
  );
}

export function EducationSection({ form }: { form: ResumeForm }) {
  return (
    <Section title="Education">
      <form.Field mode="array" name="education">
        {(edu) => (
          <EducationRows
            form={form}
            onMove={edu.moveValue}
            onPush={edu.pushValue}
            onRemove={edu.removeValue}
            values={edu.state.value as ResumeData["education"]}
          />
        )}
      </form.Field>
    </Section>
  );
}

function SystemRows({
  form,
  onMove,
  onPush,
  onRemove,
  values,
}: {
  form: ResumeForm;
  onMove: (from: number, to: number) => void;
  onPush: (value: ResumeData["systems"][number]) => void;
  onRemove: (index: number) => void;
  values: ResumeData["systems"];
}) {
  const { keys, handleRemove, handleMove } = useKeyedList(values.length, onRemove, onMove);

  return (
    <div className="flex flex-col gap-3">
      {values.map((_, i) => (
        <ItemCard
          canMoveDown={i < values.length - 1}
          canMoveUp={i > 0}
          index={i}
          key={keys[i]}
          onMove={handleMove}
          onRemove={handleRemove}
          title={`Group ${i + 1}`}
        >
          <form.Field name={`systems[${i}].label`}>
            {(f) => <TextField field={f} label="Label" placeholder="Bank Portals" />}
          </form.Field>
          <form.Field name={`systems[${i}].value`}>
            {(f) => <TextAreaField field={f} label="Items" rows={2} />}
          </form.Field>
        </ItemCard>
      ))}
      <AddButton makeValue={emptySystem} onAdd={onPush}>
        Add group
      </AddButton>
    </div>
  );
}

export function SystemsSection({ form }: { form: ResumeForm }) {
  return (
    <Section title="Systems & Technical Proficiency">
      <form.Field mode="array" name="systems">
        {(sys) => (
          <SystemRows
            form={form}
            onMove={sys.moveValue}
            onPush={sys.pushValue}
            onRemove={sys.removeValue}
            values={sys.state.value as ResumeData["systems"]}
          />
        )}
      </form.Field>
    </Section>
  );
}

function ReferenceRows({
  form,
  onMove,
  onPush,
  onRemove,
  values,
}: {
  form: ResumeForm;
  onMove: (from: number, to: number) => void;
  onPush: (value: ResumeData["references"][number]) => void;
  onRemove: (index: number) => void;
  values: ResumeData["references"];
}) {
  const { keys, handleRemove, handleMove } = useKeyedList(values.length, onRemove, onMove);

  return (
    <div className="flex flex-col gap-3">
      {values.map((_, i) => (
        <ItemCard
          canMoveDown={i < values.length - 1}
          canMoveUp={i > 0}
          index={i}
          key={keys[i]}
          onMove={handleMove}
          onRemove={handleRemove}
          title={`Reference ${i + 1}`}
        >
          <form.Field name={`references[${i}].name`}>
            {(f) => <TextField field={f} label="Name" />}
          </form.Field>
          <form.Field name={`references[${i}].role`}>
            {(f) => <TextField field={f} label="Role / firm" />}
          </form.Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <form.Field name={`references[${i}].phone`}>
              {(f) => <TextField field={f} label="Phone" />}
            </form.Field>
            <form.Field name={`references[${i}].email`}>
              {(f) => <TextField field={f} label="Email" />}
            </form.Field>
          </div>
        </ItemCard>
      ))}
      <AddButton makeValue={emptyReference} onAdd={onPush}>
        Add reference
      </AddButton>
    </div>
  );
}

export function ReferencesSection({ form }: { form: ResumeForm }) {
  return (
    <Section title="References">
      <form.Field mode="array" name="references">
        {(refs) => (
          <ReferenceRows
            form={form}
            onMove={refs.moveValue}
            onPush={refs.pushValue}
            onRemove={refs.removeValue}
            values={refs.state.value as ResumeData["references"]}
          />
        )}
      </form.Field>
    </Section>
  );
}
