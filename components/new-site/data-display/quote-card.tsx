import { Quote } from "lucide-react";
import TypewriterTitle from "@/components/ui/kokonutui/type-writer";
import { QUOTES } from "@/lib/new-site/data";

const sequences = QUOTES.map((q) => ({
  text: q.author ? `${q.text} — ${q.author}` : q.text,
  deleteAfter: true,
  pauseAfter: 3500,
}));

export default function QuoteCard() {
  return (
    <section className="space-y-2.5">
      <h3 className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
        Words I Live By
      </h3>
      <figure className="relative rounded-lg border bg-muted/30 p-3">
        <Quote
          aria-hidden
          className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground/40"
          fill="currentColor"
        />
        <blockquote className="min-h-[3.5em] pt-3.5 text-muted-foreground text-xs leading-relaxed">
          <TypewriterTitle
            inline
            sequences={sequences}
            typingSpeed={40}
            deleteSpeed={15}
            loopDelay={800}
            textClassName="text-muted-foreground text-xs leading-relaxed"
            cursorClassName="bg-muted-foreground/60"
          />
        </blockquote>
      </figure>
    </section>
  );
}
