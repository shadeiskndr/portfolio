import Image from "next/image";
import { TOOLS } from "@/lib/new-site/data";

export default function ToolsGrid() {
  return (
    <section className="space-y-2.5">
      <h3 className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
        Tools & Platforms
      </h3>
      <ul className="grid grid-cols-7 gap-1.5">
        {TOOLS.map((tool) => (
          <li
            key={tool.label}
            className="group relative flex aspect-square items-center justify-center rounded-md bg-muted/40 p-1 transition-colors hover:bg-muted"
            title={tool.label}
          >
            <Image
              src={tool.logo}
              alt={tool.label}
              width={16}
              height={16}
              className="h-4 w-4 object-contain"
              unoptimized
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
