import FlipAvatar from "@/components/new-site/data-display/flip-avatar";
import TypewriterTitle from "@/components/ui/kokonutui/type-writer";
import { PERSONAL } from "@/lib/new-site/data";

const TAGLINE_SEQUENCES = PERSONAL.taglineSuffixes.map((text, i, arr) => ({
  text,
  deleteAfter: i !== arr.length - 1 || arr.length > 1,
}));

export default function AvatarCard() {
  return (
    <div className="flex flex-col gap-2.5">
      <FlipAvatar
        alt={PERSONAL.name}
        backKey={PERSONAL.avatarAltKey}
        frontKey={PERSONAL.avatarKey}
      />
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
