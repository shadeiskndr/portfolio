import Image from "next/image";
import { TOOLS } from "@/lib/new-site/data";

export default function ToolsGrid() {
  return (
    <section className="space-y-3">
      <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
        Tools & Platforms
      </h3>
      <ul className="grid grid-cols-6 gap-2">
        {TOOLS.map((tool) => (
          <li
            key={tool.label}
            className="group relative flex aspect-square items-center justify-center rounded-md bg-muted/40 p-1.5 transition-colors hover:bg-muted"
            title={tool.label}
          >
            <Image
              src={tool.logo}
              alt={tool.label}
              width={20}
              height={20}
              className="h-5 w-5 object-contain"
              unoptimized
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
