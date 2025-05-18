"use client";
import { ChevronDown } from "lucide-react";
import Link from "@/components/navigation/link";
import {
  DropdownMenu as UIDropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
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
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2">
          {label} <ChevronDown />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {links.map((link, index) => (
          <DropdownMenuItem key={index} asChild>
            <Link href={link.href} className="text-foreground hover:text-muted-foreground">
              {link.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </UIDropdownMenu>
  );
};

export default DropdownMenu;
