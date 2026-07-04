"use client";

import { m } from "motion/react";
import { useState } from "react";
import AnimatedTabs from "@/components/ui/smoothui/animated-tabs";
import StackedCarousel, { type CarouselItem } from "@/components/ui/smoothui/stacked-carousel";
import { RECOGNITIONS, TESTIMONIALS } from "@/lib/new-site/data";
import CertificatesList from "./certificates-list";

const EDUCATION_ITEMS: CarouselItem[] = RECOGNITIONS.map((r) => ({
  id: r.title,
  content: (
    <div className="text-center">
      <p className="font-semibold font-serif text-2xl text-foreground">{r.detail}</p>
      <p className="mt-2 font-medium text-sm leading-snug">{r.title}</p>
      {r.meta ? <p className="mt-1 text-muted-foreground text-xs">{r.meta}</p> : null}
    </div>
  ),
}));

const TESTIMONIAL_ITEMS: CarouselItem[] = TESTIMONIALS.map((t, i) => ({
  id: `${t.name}-${i}`,
  content: (
    <figure>
      <blockquote className="relative">
        <div className="absolute -top-1 -left-2 text-4xl text-foreground/10 leading-none dark:text-foreground/5">
          “
        </div>
        <p className="relative text-foreground/80 text-sm leading-relaxed">{t.quote}</p>
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-2 border-foreground/5 border-t pt-4">
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-xs">{t.name}</span>
          <span className="text-foreground/50 text-xs">{t.role}</span>
        </div>
      </figcaption>
    </figure>
  ),
}));

export default function AccoladesTabs() {
  const hasTestimonials = TESTIMONIAL_ITEMS.length > 0;

  const tabs = [
    { id: "certificates", label: "Certificates" },
    { id: "education", label: "Education" },
    ...(hasTestimonials ? [{ id: "kind-words", label: "Kind words" }] : []),
  ];

  const [active, setActive] = useState("certificates");

  return (
    <div className="space-y-6">
      <AnimatedTabs
        tabs={tabs}
        variant="pill"
        radius="rounded-2xl"
        activeTab={active}
        onChange={setActive}
        className="max-w-full overflow-x-auto"
      />

      <m.div
        key={active}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {active === "certificates" ? <CertificatesList /> : null}
        {active === "education" ? <StackedCarousel items={EDUCATION_ITEMS} height="280px" /> : null}
        {active === "kind-words" && hasTestimonials ? (
          <StackedCarousel items={TESTIMONIAL_ITEMS} autoPlay height="320px" />
        ) : null}
      </m.div>
    </div>
  );
}
