"use client";
import { ChevronDown } from "lucide-react";
import Link from "@/components/old-portfolio/navigation/link";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenu as UIDropdownMenu,
} from "@/components/ui/dropdown-menu";

interface LinkItem {
  href: string;
  label: string;
}

interface DropdownMenuProps {
  label: string;
  links: LinkItem[];
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ label, links }) => {
  return (
    <UIDropdownMenu>
      <DropdownMenuTrigger
        render={
          <button type="button" className="flex items-center gap-2">
            {label} <ChevronDown />
          </button>
        }
      />
      <DropdownMenuContent>
        {links.map((link, index) => (
          <DropdownMenuItem
            key={index}
            render={
              <Link href={link.href} className="text-foreground hover:text-muted-foreground">
                {link.label}
              </Link>
            }
          />
        ))}
      </DropdownMenuContent>
    </UIDropdownMenu>
  );
};

export default DropdownMenu;
