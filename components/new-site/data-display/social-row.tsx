import { Lightbulb } from "lucide-react";
import { IdeasDialog } from "@/components/new-site/data-display/ideas-dialog";
import { ResumeDialog } from "@/components/new-site/data-display/resume-dialog";
import { Button } from "@/components/ui/button";
import { SOCIAL_LINKS } from "@/lib/new-site/data";

const iconButtonClassName = "rounded-full text-muted-foreground";

export default function SocialRow() {
  return (
    <div className="flex flex-wrap items-center gap-0.75">
      {SOCIAL_LINKS.map(({ label, icon: Icon, url }) => {
        if (label === "Resume") {
          return (
            <ResumeDialog key={label}>
              <Button
                variant="ghost"
                size="icon"
                aria-label={label}
                className={iconButtonClassName}
              >
                <Icon className="h-4 w-4" />
              </Button>
            </ResumeDialog>
          );
        }

        return (
          <Button
            key={label}
            variant="ghost"
            size="icon"
            className={iconButtonClassName}
            nativeButton={false}
            render={
              <a
                href={url}
                aria-label={label}
                target={url.startsWith("http") ? "_blank" : undefined}
                rel={url.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                <Icon className="h-4 w-4" />
              </a>
            }
          />
        );
      })}
      <IdeasDialog>
        <Button variant="ghost" size="icon" aria-label="Ideas" className={iconButtonClassName}>
          <Lightbulb className="h-4 w-4" />
        </Button>
      </IdeasDialog>
    </div>
  );
}
