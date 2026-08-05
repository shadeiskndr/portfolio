import PageHeader from "@/components/new-site/content/page-header";
import PhotoGallery from "@/components/new-site/content/photo-gallery";
import { getPhotos } from "@/lib/photos-server";

export const metadata = {
  title: "Photography",
  description: "Pictures from the road and from home.",
};

export default async function PhotographyPage() {
  const photos = await getPhotos();
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Photography" description="Pictures from the road and from home." />
      <PhotoGallery initialPhotos={photos} />
    </div>
  );
}
