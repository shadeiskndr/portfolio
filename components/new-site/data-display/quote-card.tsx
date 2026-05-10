import { Quote } from "lucide-react";
import { QUOTES } from "@/lib/new-site/data";

export default function QuoteCard() {
  const quote = QUOTES[0];
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
        <blockquote className="pt-3.5 text-muted-foreground text-xs leading-relaxed">
          {quote.text}
        </blockquote>
        {quote.author ? (
          <figcaption className="mt-1.5 text-[10px] text-muted-foreground/70">
            — {quote.author}
          </figcaption>
        ) : null}
      </figure>
    </section>
  );
}
