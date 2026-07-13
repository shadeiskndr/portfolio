import ResumeBuilder from "@/components/new-site/resume-builder/resume-builder";

export const metadata = { title: "Resume Builder" };

export default function ResumeBuilderPage() {
  return (
    // Mobile keeps the shell's padding so the builder's controls clear the
    // dock; the desktop bleed is unchanged.
    <div className="mx-auto w-full max-w-5xl lg:-my-10">
      <ResumeBuilder />
    </div>
  );
}
