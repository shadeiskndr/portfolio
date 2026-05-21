import PageHeader from "@/components/new-site/content/page-header";
import PhotoGallery from "@/components/new-site/content/photo-gallery";

export const metadata = {
  title: "Photography",
  description: "Pictures from the road and from home.",
};

export default function PhotographyPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Photography" description="Pictures from the road and from home." />
      <PhotoGallery />
    </div>
  );
}
