"use client";

import { Award, ChevronRight, ExternalLink } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { AssetImage } from "@/components/asset-image";
import { SpotlightCard } from "@/components/ui/componentry/spotlight-card";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";
import { CERTIFICATES, type Certificate } from "@/lib/new-site/data";

function CertLogo({ cert, size }: { cert: Certificate; size: number }) {
  const style = { width: size, height: size };
  const logoKey = cert.logoKey ?? cert.imageKey;
  if (logoKey) {
    return (
      <span
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted/50 p-1 ring-1 ring-border"
        style={style}
      >
        <AssetImage
          assetKey={logoKey}
          alt=""
          width={size}
          height={size}
          sizes={`${size}px`}
          priority
          className="size-full object-contain"
        />
      </span>
    );
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground ring-1 ring-border"
      style={style}
    >
      <Award className="size-5" />
    </span>
  );
}

export default function CertificatesList() {
  const [active, setActive] = useState<Certificate | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useOnClickOutside(ref, () => setActive(null));

  useMountEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActive(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const morph = shouldReduceMotion
    ? { duration: 0 }
    : {
        type: "spring" as const,
        duration: 0.25,
        bounce: 0.1,
        layout: { duration: 0.25, ease: [0.645, 0.045, 0.355, 1] as const },
      };

  return (
    <>
      <AnimatePresence>
        {active ? (
          <m.div
            key="cert-overlay"
            className="fixed inset-0 z-50 grid place-items-center bg-background/60 p-4 backdrop-blur-sm"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
          >
            <m.div
              ref={ref}
              layoutId={shouldReduceMotion ? undefined : `cert-${active.name}`}
              className="flex w-full max-w-md cursor-default select-none flex-col gap-4 overflow-hidden rounded-2xl border bg-card p-5 shadow-lg"
              transition={morph}
            >
              <div className="flex items-start gap-3">
                <m.div
                  layoutId={shouldReduceMotion ? undefined : `cert-logo-${active.name}`}
                  style={{ flexShrink: 0 }}
                >
                  <CertLogo cert={active} size={48} />
                </m.div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm leading-snug">{active.name}</h3>
                  <p className="mt-0.5 text-muted-foreground text-xs">{active.issuer}</p>
                </div>
              </div>

              {active.imageKey ? (
                <div className="flex items-center justify-center rounded-lg bg-muted/30 p-4">
                  <AssetImage
                    assetKey={active.imageKey}
                    alt={`${active.name} certificate`}
                    sizes="220px"
                    priority
                    className="h-auto w-full max-w-55 rounded-md shadow-md"
                  />
                </div>
              ) : null}

              <m.p
                className="text-muted-foreground text-sm leading-relaxed"
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2, delay: 0.05 }}
              >
                {active.description}
              </m.p>

              {active.url ? (
                <a
                  href={active.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-medium text-foreground text-xs transition-colors hover:bg-muted"
                >
                  Verify credential
                  <ExternalLink className="size-3.5" />
                </a>
              ) : null}
            </m.div>
          </m.div>
        ) : null}
      </AnimatePresence>

      <div className="flex flex-col gap-2.5">
        {CERTIFICATES.map((cert) => (
          <m.button
            key={cert.name}
            type="button"
            layoutId={shouldReduceMotion ? undefined : `cert-${cert.name}`}
            onClick={() => setActive(cert)}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
            transition={morph}
            className="block w-full cursor-pointer select-none rounded-2xl text-left"
          >
            <SpotlightCard borderColor="var(--border)" className="p-3 shadow-sm dark:shadow-xl">
              <div className="flex items-center gap-3">
                <m.div
                  layoutId={shouldReduceMotion ? undefined : `cert-logo-${cert.name}`}
                  style={{ flexShrink: 0 }}
                >
                  <CertLogo cert={cert} size={40} />
                </m.div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm">{cert.name}</p>
                  <p className="truncate text-muted-foreground text-xs">{cert.issuer}</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </div>
            </SpotlightCard>
          </m.button>
        ))}
      </div>
    </>
  );
}
