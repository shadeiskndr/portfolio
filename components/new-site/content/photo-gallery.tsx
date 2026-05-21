"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const images = [
  "https://picsum.photos/800/600?random=1",
  "https://picsum.photos/640/480?random=2",
  "https://picsum.photos/1280/720?random=3",
  "https://picsum.photos/960/540?random=4",
  "https://picsum.photos/900/300?random=5",
  "https://picsum.photos/1200/600?random=6",
  "https://picsum.photos/400/600?random=7",
  "https://picsum.photos/300/450?random=8",
  "https://picsum.photos/600/800?random=9",
  "https://picsum.photos/450/600?random=10",
  "https://picsum.photos/600/600?random=11",
  "https://picsum.photos/500/550?random=12",
  "https://picsum.photos/700/850?random=13",
  "https://picsum.photos/1280/960?random=14",
  "https://picsum.photos/1440/810?random=15",
  "https://picsum.photos/1024/768?random=16",
  "https://picsum.photos/800/800?random=17",
  "https://picsum.photos/1080/720?random=18",
  "https://picsum.photos/1920/1080?random=19",
  "https://picsum.photos/1280/800?random=20",
  "https://picsum.photos/800/400?random=21",
  "https://picsum.photos/1024/576?random=22",
  "https://picsum.photos/640/360?random=23",
];

export default function PhotoGallery() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="columns-2 gap-4 space-y-4 sm:columns-3">
      {images.map((src, index) => {
        const isDimmed = hovered !== null && hovered !== index;
        return (
          <motion.div
            className="group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            key={src}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.6) }}
            viewport={{ once: true, margin: "-80px" }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <motion.img
              alt=""
              className={cn(
                "w-full rounded-2xl object-cover transition duration-300 ease-out",
                isDimmed ? "scale-100 blur-sm" : "scale-100 blur-0",
                hovered === index && "scale-[1.03]"
              )}
              decoding="async"
              loading="lazy"
              src={src}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
