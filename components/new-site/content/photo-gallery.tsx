"use client";

import { Calendar, Camera, ChevronLeft, ChevronRight, Film, MapPin, X } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

type Photo = {
  src: string;
  title: string;
  date: string;
  location: string;
  camera: string;
  film: string;
};

const images: Photo[] = [
  {
    src: "https://picsum.photos/800/600?random=1",
    title: "Sleeping Cat",
    date: "December 26, 2025",
    location: "Tamarind Square, Cyberjaya",
    camera: "Nikon F3 w/ 105mm f2.5",
    film: "Kodak Gold 200",
  },
  {
    src: "https://picsum.photos/640/480?random=2",
    title: "Sugeh River Monster",
    date: "April 7, 2026",
    location: "Sugeh Resort, Khaii Estate",
    camera: "Nikon F3 w/ 50mm f1.2",
    film: "Kodak Gold 200",
  },
  {
    src: "https://picsum.photos/1280/720?random=3",
    title: "Morning Commute",
    date: "January 14, 2026",
    location: "KL Sentral, Kuala Lumpur",
    camera: "Fujifilm X100V",
    film: "Classic Chrome",
  },
  {
    src: "https://picsum.photos/960/540?random=4",
    title: "Empty Bench",
    date: "February 2, 2026",
    location: "Taman Tasik Perdana",
    camera: "Leica M6 w/ 35mm f2",
    film: "Ilford HP5+ 400",
  },
  {
    src: "https://picsum.photos/900/300?random=5",
    title: "Long Exposure",
    date: "March 18, 2026",
    location: "Putrajaya",
    camera: "Sony A7 IV w/ 24-70mm f2.8",
    film: "Digital",
  },
  {
    src: "https://picsum.photos/1200/600?random=6",
    title: "Saturday Market",
    date: "March 22, 2026",
    location: "Pasar Seni, KL",
    camera: "Nikon F3 w/ 50mm f1.2",
    film: "Portra 400",
  },
  {
    src: "https://picsum.photos/400/600?random=7",
    title: "Through the Window",
    date: "April 1, 2026",
    location: "Subang Jaya",
    camera: "Fujifilm X100V",
    film: "Acros",
  },
  {
    src: "https://picsum.photos/300/450?random=8",
    title: "Tropical Greens",
    date: "April 15, 2026",
    location: "FRIM, Kepong",
    camera: "Nikon F3 w/ 105mm f2.5",
    film: "Ektar 100",
  },
  {
    src: "https://picsum.photos/600/800?random=9",
    title: "Stairwell",
    date: "May 3, 2026",
    location: "Chow Kit, KL",
    camera: "Leica M6 w/ 35mm f2",
    film: "Tri-X 400",
  },
  {
    src: "https://picsum.photos/450/600?random=10",
    title: "Late Night Mamak",
    date: "May 12, 2026",
    location: "SS15, Subang",
    camera: "Sony A7 IV w/ 35mm f1.4",
    film: "Digital",
  },
  {
    src: "https://picsum.photos/600/600?random=11",
    title: "Concrete & Sky",
    date: "May 28, 2026",
    location: "Bukit Bintang",
    camera: "Fujifilm X100V",
    film: "Velvia",
  },
  {
    src: "https://picsum.photos/500/550?random=12",
    title: "Old Friend",
    date: "June 6, 2026",
    location: "Bangsar",
    camera: "Nikon F3 w/ 50mm f1.2",
    film: "Portra 800",
  },
  {
    src: "https://picsum.photos/700/850?random=13",
    title: "Coffee Hands",
    date: "June 19, 2026",
    location: "TTDI",
    camera: "Leica Q2",
    film: "Digital",
  },
  {
    src: "https://picsum.photos/1280/960?random=14",
    title: "Sunday Drive",
    date: "July 4, 2026",
    location: "Genting Highlands",
    camera: "Sony A7 IV w/ 70-200mm f2.8",
    film: "Digital",
  },
  {
    src: "https://picsum.photos/1440/810?random=15",
    title: "Skyline",
    date: "July 15, 2026",
    location: "Mont Kiara",
    camera: "Nikon Z8 w/ 24-120mm f4",
    film: "Digital",
  },
  {
    src: "https://picsum.photos/1024/768?random=16",
    title: "Wet Roads",
    date: "July 30, 2026",
    location: "Damansara Heights",
    camera: "Fujifilm X100V",
    film: "Classic Negative",
  },
  {
    src: "https://picsum.photos/800/800?random=17",
    title: "Quiet Corner",
    date: "August 9, 2026",
    location: "Ampang",
    camera: "Leica M6 w/ 50mm f1.4",
    film: "Cinestill 800T",
  },
  {
    src: "https://picsum.photos/1080/720?random=18",
    title: "Bridge Light",
    date: "August 21, 2026",
    location: "Klang River, KL",
    camera: "Nikon F3 w/ 28mm f2.8",
    film: "Portra 400",
  },
  {
    src: "https://picsum.photos/1920/1080?random=19",
    title: "Open Field",
    date: "September 2, 2026",
    location: "Janda Baik",
    camera: "Sony A7 IV w/ 16-35mm f2.8",
    film: "Digital",
  },
  {
    src: "https://picsum.photos/1280/800?random=20",
    title: "Detour",
    date: "September 17, 2026",
    location: "Cameron Highlands",
    camera: "Fujifilm X100V",
    film: "Eterna",
  },
  {
    src: "https://picsum.photos/800/400?random=21",
    title: "Last Light",
    date: "October 4, 2026",
    location: "Port Dickson",
    camera: "Leica M6 w/ 50mm f1.4",
    film: "Portra 800",
  },
  {
    src: "https://picsum.photos/1024/576?random=22",
    title: "Sunday Brunch",
    date: "October 20, 2026",
    location: "Bangsar Village",
    camera: "Nikon Z8 w/ 50mm f1.8",
    film: "Digital",
  },
  {
    src: "https://picsum.photos/640/360?random=23",
    title: "Walk Home",
    date: "November 9, 2026",
    location: "Petaling Street",
    camera: "Fujifilm X100V",
    film: "Acros",
  },
];

export default function PhotoGallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [openedFromIndex, setOpenedFromIndex] = useState<number | null>(null);
  const baseId = useId();
  const layoutIds = images.map((_, i) => `${baseId}-${i}`);

  const handleOpen = (i: number) => {
    setOpenedFromIndex(i);
    setActiveIndex(i);
  };

  return (
    <MotionConfig transition={{ type: "spring", stiffness: 225, damping: 25 }}>
      <div className="columns-2 gap-4 space-y-4 sm:columns-3">
        {images.map((photo, index) => (
          <GalleryImage
            index={index}
            key={photo.src}
            layoutId={layoutIds[index]}
            onClick={() => handleOpen(index)}
            src={photo.src}
            title={photo.title}
          />
        ))}
      </div>
      <ImageModal
        activeIndex={activeIndex}
        morphLayoutId={openedFromIndex !== null ? layoutIds[openedFromIndex] : null}
        onClose={() => setActiveIndex(null)}
        onNavigate={setActiveIndex}
        photos={images}
      />
    </MotionConfig>
  );
}

function GalleryImage({
  src,
  title,
  index,
  layoutId,
  onClick,
}: {
  src: string;
  title: string;
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
      <motion.img
        alt={title}
        className="w-full cursor-pointer object-cover shadow-lg transition-[filter] duration-300 ease-out group-hover:blur-[3px]"
        decoding="async"
        layoutId={layoutId}
        loading="lazy"
        onClick={onClick}
        src={src}
        style={{ borderRadius: 16 }}
        whileTap={{ scale: 0.98, transition: { duration: 0.15 } }}
      />
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
            <motion.img
              alt={activePhoto?.title ?? ""}
              className="max-h-full max-w-full object-contain shadow-2xl"
              layoutId={morphLayoutId ?? undefined}
              src={activePhoto?.src}
              style={{ borderRadius: 28 }}
            />
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
                  <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-muted-foreground text-xs">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" aria-hidden />
                      {activePhoto.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      {activePhoto.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Camera className="h-3.5 w-3.5" aria-hidden />
                      {activePhoto.camera}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Film className="h-3.5 w-3.5" aria-hidden />
                      {activePhoto.film}
                    </span>
                  </div>
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
                    <img
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      src={photo.src}
                    />
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
