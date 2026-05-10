import { Quote } from "lucide-react";
import { QUOTES } from "@/lib/new-site/data";

export default function QuoteCard() {
  const quote = QUOTES[0];
  return (
    <section className="space-y-3">
      <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
        Words I Live By
      </h3>
      <figure className="relative rounded-lg border bg-muted/30 p-4">
        <Quote
          aria-hidden
          className="absolute top-3 left-3 h-4 w-4 text-muted-foreground/40"
          fill="currentColor"
        />
        <blockquote className="pt-4 text-muted-foreground text-sm leading-relaxed">
          {quote.text}
        </blockquote>
        {quote.author ? (
          <figcaption className="mt-2 text-muted-foreground/70 text-xs">
            — {quote.author}
          </figcaption>
        ) : null}
      </figure>
    </section>
  );
}
