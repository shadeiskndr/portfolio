import Image from "next/image";
import { PERSONAL } from "@/lib/new-site/data";

export default function AvatarCard() {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
        <Image
          src={PERSONAL.avatar}
          alt={PERSONAL.name}
          fill
          sizes="280px"
          className="object-cover"
          priority
        />
      </div>
      <div className="space-y-1">
        <h2 className="font-bold text-2xl tracking-tight">
          {PERSONAL.name} <span className="text-muted-foreground">{PERSONAL.emoji}</span>
        </h2>
        <p className="text-muted-foreground text-sm">
          {PERSONAL.age} · {PERSONAL.location} {PERSONAL.flag} · {PERSONAL.status}
        </p>
        <p className="text-sm">
          <span className="text-muted-foreground italic">{PERSONAL.tagline}</span>{" "}
          <span className="font-medium">{PERSONAL.taglineSuffix}</span>
        </p>
      </div>
    </div>
  );
}
