import Image from "next/image";
import TypewriterTitle from "@/components/ui/kokonutui/type-writer";
import { PERSONAL } from "@/lib/new-site/data";

const TAGLINE_SEQUENCES = PERSONAL.taglineSuffixes.map((text, i, arr) => ({
  text,
  deleteAfter: i !== arr.length - 1 || arr.length > 1,
}));

export default function AvatarCard() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative mx-auto aspect-square w-full max-w-44 overflow-hidden rounded-xl bg-muted">
        <Image
          src={PERSONAL.avatar}
          alt={PERSONAL.name}
          fill
          sizes="240px"
          className="object-cover"
          priority
        />
      </div>
      <div className="space-y-0.5">
        <h2 className="font-bold text-lg tracking-tight">
          {PERSONAL.name} <span className="text-muted-foreground">{PERSONAL.emoji}</span>
        </h2>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {PERSONAL.age} · {PERSONAL.location} · {PERSONAL.flag}
        </p>
        <p className="text-xs">
          <span className="text-muted-foreground italic">{PERSONAL.tagline}</span>{" "}
          <TypewriterTitle
            inline
            sequences={TAGLINE_SEQUENCES}
            textClassName="italic"
            typingSpeed={120}
            deleteSpeed={70}
            pauseBeforeDelete={1800}
            loopDelay={1500}
            autoLoop
          />
        </p>
      </div>
    </div>
  );
}
