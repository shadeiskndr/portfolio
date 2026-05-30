import { preloadQuery } from "convex/nextjs";
import PageHeader from "@/components/new-site/content/page-header";
import PhotoGallery from "@/components/new-site/content/photo-gallery";
import { api } from "@/convex/_generated/api";

export const metadata = {
  title: "Photography",
  description: "Pictures from the road and from home.",
};

export default async function PhotographyPage() {
  const preloadedPhotos = await preloadQuery(api.photos.list);
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Photography" description="Pictures from the road and from home." />
      <PhotoGallery preloadedPhotos={preloadedPhotos} />
    </div>
  );
}
