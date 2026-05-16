import { Lightbulb } from "lucide-react";
import { IdeasDialog } from "@/components/new-site/data-display/ideas-dialog";
import { SOCIAL_LINKS } from "@/lib/new-site/data";

export default function SocialRow() {
  return (
    <div className="flex flex-wrap items-center gap-0.75">
      {SOCIAL_LINKS.map(({ label, icon: Icon, url }) => (
        <a
          key={label}
          href={url}
          aria-label={label}
          target={url.startsWith("http") ? "_blank" : undefined}
          rel={url.startsWith("http") ? "noopener noreferrer" : undefined}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
      <IdeasDialog>
        <button
          type="button"
          aria-label="Ideas"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Lightbulb className="h-4 w-4" />
        </button>
      </IdeasDialog>
    </div>
  );
}
