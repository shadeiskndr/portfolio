"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { AssetImage } from "@/components/asset-image";
import { BlurFade } from "@/components/ui/magicui/blur-fade";
import { PROJECTS, type Project } from "@/lib/new-site/data";
import { cn } from "@/lib/utils";

const TILT_MAX = 9;
const TILT_SPRING = { stiffness: 300, damping: 28 } as const;
const GLOW_SPRING = { stiffness: 180, damping: 22 } as const;

interface CardProps {
  project: Project;
  dimmed: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

function Card({ project, dimmed, onHoverStart, onHoverEnd }: CardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  const normX = useMotionValue(0.5);
  const normY = useMotionValue(0.5);

  const rawRotateX = useTransform(normY, [0, 1], [TILT_MAX, -TILT_MAX]);
  const rawRotateY = useTransform(normX, [0, 1], [-TILT_MAX, TILT_MAX]);

  const rotateX = useSpring(rawRotateX, TILT_SPRING);
  const rotateY = useSpring(rawRotateY, TILT_SPRING);
  const glowOpacity = useSpring(0, GLOW_SPRING);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    normX.set((e.clientX - rect.left) / rect.width);
    normY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseEnter = () => {
    glowOpacity.set(1);
    onHoverStart();
  };

  const handleMouseLeave = () => {
    normX.set(0.5);
    normY.set(0.5);
    glowOpacity.set(0);
    onHoverEnd();
  };

  return (
    <motion.a
      href={project.url}
      target="_blank"
      rel="noreferrer"
      ref={cardRef}
      animate={{
        scale: dimmed ? 0.96 : 1,
        opacity: dimmed ? 0.5 : 1,
      }}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border",
        "border-border bg-card",
        "transition-[border-color] duration-300",
        "hover:border-foreground/20"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 900,
      }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: `radial-gradient(ellipse at 20% 20%, ${project.color}14, transparent 65%)`,
        }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          opacity: glowOpacity,
          background: `radial-gradient(ellipse at 20% 20%, ${project.color}2e, transparent 65%)`,
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[55%] -translate-x-full -skew-x-12 bg-linear-to-r from-transparent via-foreground/4 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[280%]"
      />

      <div className="relative aspect-video w-full overflow-hidden bg-muted/40">
        <AssetImage
          assetKey={project.imageKey}
          alt={`${project.title} screenshot`}
          fill
          sizes="(min-width: 640px) 320px, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>

      <div className="relative z-10 flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-semibold text-[14px] tracking-tight">{project.title}</h3>
          <p className="text-[12.5px] text-muted-foreground leading-relaxed">
            {project.description}
          </p>
        </div>

        <ul className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {project.technologies.map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground tracking-wide"
            >
              {tech}
            </li>
          ))}
        </ul>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full transition-all duration-500 group-hover:w-full"
        style={{
          background: `linear-gradient(to right, ${project.color}80, transparent)`,
        }}
      />
    </motion.a>
  );
}

export default function ProjectsSpotlight({ projects = PROJECTS }: { projects?: Project[] }) {
  const [hoveredTitle, setHoveredTitle] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {projects.map((project, index) => (
        <BlurFade key={project.title} delay={index * 0.06} blur="0px" className="h-full">
          <Card
            project={project}
            dimmed={hoveredTitle !== null && hoveredTitle !== project.title}
            onHoverStart={() => setHoveredTitle(project.title)}
            onHoverEnd={() => setHoveredTitle(null)}
          />
        </BlurFade>
      ))}
    </div>
  );
}
