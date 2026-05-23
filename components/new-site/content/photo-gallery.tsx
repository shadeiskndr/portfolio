"use client";

import { useQuery } from "convex/react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Image from "next/image";
import { useId, useState } from "react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

type Photo = {
  src: string;
  title: string;
  date: string;
  description: string;
  width: number;
  height: number;
};

export default function PhotoGallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [openedFromIndex, setOpenedFromIndex] = useState<number | null>(null);
  const baseId = useId();
  const photos = useQuery(api.photos.list);

  if (!photos || photos.length === 0) return null;

  const layoutIds = photos.map((_, i) => `${baseId}-${i}`);

  const handleOpen = (i: number) => {
    setOpenedFromIndex(i);
    setActiveIndex(i);
  };

  return (
    <MotionConfig transition={{ type: "spring", stiffness: 225, damping: 25 }}>
      <div className="columns-2 gap-4 space-y-4 sm:columns-3">
        {photos.map((photo, index) => (
          <GalleryImage
            height={photo.height}
            index={index}
            key={photo.src}
            layoutId={layoutIds[index]}
            onClick={() => handleOpen(index)}
            src={photo.src}
            title={photo.title}
            width={photo.width}
          />
        ))}
      </div>
      <ImageModal
        activeIndex={activeIndex}
        morphLayoutId={openedFromIndex !== null ? layoutIds[openedFromIndex] : null}
        onClose={() => setActiveIndex(null)}
        onNavigate={setActiveIndex}
        photos={photos}
      />
    </MotionConfig>
  );
}

function GalleryImage({
  src,
  title,
  width,
  height,
  index,
  layoutId,
  onClick,
}: {
  src: string;
  title: string;
  width: number;
  height: number;
  index: number;
  layoutId: string;
  onClick: () => void;
}) {
  return (
    <motion.div
      className="group relative mb-4 break-inside-avoid"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.6) }}
      viewport={{ once: true, margin: "-80px" }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <motion.div
        className="w-full cursor-pointer overflow-hidden shadow-lg transition-[filter] duration-300 ease-out group-hover:blur-[3px]"
        layoutId={layoutId}
        onClick={onClick}
        style={{ borderRadius: 16 }}
        whileTap={{ scale: 0.98, transition: { duration: 0.15 } }}
      >
        <Image
          alt={title}
          className="h-auto w-full object-cover"
          height={height}
          sizes="(min-width: 640px) 33vw, 50vw"
          src={src}
          width={width}
        />
      </motion.div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/70 via-black/30 to-transparent"
          style={{ borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}
        />
        <p className="relative font-medium text-sm text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
          {title}
        </p>
      </div>
    </motion.div>
  );
}

function ImageModal({
  activeIndex,
  photos,
  morphLayoutId,
  onClose,
  onNavigate,
}: {
  activeIndex: number | null;
  photos: Photo[];
  morphLayoutId: string | null;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const isOpen = activeIndex !== null;
  const activePhoto = activeIndex !== null ? photos[activeIndex] : null;
  const goPrev = () => {
    if (activeIndex === null) return;
    onNavigate((activeIndex - 1 + photos.length) % photos.length);
  };
  const goNext = () => {
    if (activeIndex === null) return;
    onNavigate((activeIndex + 1) % photos.length);
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <div
          aria-label={activePhoto?.title ?? "Photo viewer"}
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col overflow-hidden outline-none"
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            else if (e.key === "ArrowLeft") goPrev();
            else if (e.key === "ArrowRight") goNext();
          }}
          ref={(el) => el?.focus()}
          role="dialog"
          tabIndex={-1}
        >
          <motion.div
            animate={{ opacity: 1 }}
            aria-label="Close"
            className="absolute inset-0 bg-background/90 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
            role="button"
            tabIndex={-1}
          />

          <motion.button
            animate={{ opacity: 1, scale: 1, transition: { delay: 0.2 } }}
            aria-label="Close"
            className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lg ring-1 ring-border backdrop-blur-sm hover:bg-background"
            exit={{ opacity: 0, transition: { duration: 0.05 } }}
            initial={{ opacity: 0, scale: 0.5 }}
            onClick={onClose}
            transition={{ duration: 0.1 }}
            type="button"
          >
            <X className="h-5 w-5" />
          </motion.button>

          <motion.button
            animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
            aria-label="Previous image"
            className="absolute top-1/2 left-4 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lg ring-1 ring-border backdrop-blur-sm hover:bg-background"
            exit={{ opacity: 0, x: -8, transition: { duration: 0.05 } }}
            initial={{ opacity: 0, x: -8 }}
            onClick={goPrev}
            type="button"
          >
            <ChevronLeft className="h-5 w-5" />
          </motion.button>

          <motion.button
            animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
            aria-label="Next image"
            className="absolute top-1/2 right-4 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lg ring-1 ring-border backdrop-blur-sm hover:bg-background"
            exit={{ opacity: 0, x: 8, transition: { duration: 0.05 } }}
            initial={{ opacity: 0, x: 8 }}
            onClick={goNext}
            type="button"
          >
            <ChevronRight className="h-5 w-5" />
          </motion.button>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-16 pt-12 pb-2">
            {activePhoto ? (
              <motion.div
                className="relative max-h-full max-w-full overflow-hidden shadow-2xl"
                layoutId={morphLayoutId ?? undefined}
                style={{
                  aspectRatio: `${activePhoto.width} / ${activePhoto.height}`,
                  borderRadius: 28,
                  height: "min(100%, calc((100vh - 240px)))",
                  width: "auto",
                }}
              >
                <Image
                  alt={activePhoto.title}
                  className="object-contain"
                  fill
                  priority
                  sizes="(min-width: 1024px) 80vw, 100vw"
                  src={activePhoto.src}
                />
              </motion.div>
            ) : null}
          </div>

          <motion.div
            animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
            className="relative z-10 space-y-3 pb-4"
            exit={{ opacity: 0, y: 20, transition: { duration: 0.1 } }}
            initial={{ opacity: 0, y: 20 }}
          >
            <AnimatePresence mode="wait">
              {activePhoto ? (
                <motion.div
                  animate={{ opacity: 1 }}
                  className="mx-auto max-w-3xl px-4 text-center"
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  key={activeIndex}
                  transition={{ duration: 0.15 }}
                >
                  <h3 className="font-medium text-base text-foreground">{activePhoto.title}</h3>
                  <div className="mt-1 flex items-center justify-center gap-1.5 text-muted-foreground text-xs">
                    <Calendar className="h-3.5 w-3.5" aria-hidden />
                    {activePhoto.date}
                  </div>
                  {activePhoto.description ? (
                    <p className="mt-2 text-muted-foreground text-sm">{activePhoto.description}</p>
                  ) : null}
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="scrollbar-none mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden">
              {photos.map((photo, i) => {
                const isActive = i === activeIndex;
                return (
                  <button
                    aria-current={isActive ? "true" : undefined}
                    aria-label={photo.title}
                    className={cn(
                      "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg ring-2 transition",
                      isActive ? "ring-foreground" : "opacity-50 ring-transparent hover:opacity-100"
                    )}
                    key={photo.src}
                    onClick={() => onNavigate(i)}
                    ref={(el) => {
                      if (el && isActive) {
                        el.scrollIntoView({
                          behavior: "smooth",
                          block: "nearest",
                          inline: "center",
                        });
                      }
                    }}
                    type="button"
                  >
                    <Image alt="" className="object-cover" fill sizes="64px" src={photo.src} />
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
