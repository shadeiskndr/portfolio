import { preloadQuery } from "convex/nextjs";
import { connection } from "next/server";
import { Suspense } from "react";
import PageHeader from "@/components/new-site/content/page-header";
import PhotoGallery from "@/components/new-site/content/photo-gallery";
import PhotoGallerySkeleton from "@/components/new-site/content/photo-gallery-skeleton";
import { api } from "@/convex/_generated/api";

export const metadata = {
  title: "Photography",
  description: "Pictures from the road and from home.",
};

async function PhotoGalleryContent() {
  await connection();
  const preloadedPhotos = await preloadQuery(api.photos.list);
  return <PhotoGallery preloadedPhotos={preloadedPhotos} />;
}

export default function PhotographyPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Photography" description="Pictures from the road and from home." />
      <Suspense fallback={<PhotoGallerySkeleton />}>
        <PhotoGalleryContent />
      </Suspense>
    </div>
  );
}
