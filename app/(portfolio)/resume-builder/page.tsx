import ResumeBuilder from "@/components/new-site/resume-builder/resume-builder";

export const metadata = { title: "Resume Builder" };

export default function ResumeBuilderPage() {
  return (
    <div className="mx-auto -my-6 w-full max-w-5xl lg:-my-10">
      <ResumeBuilder />
    </div>
  );
}
