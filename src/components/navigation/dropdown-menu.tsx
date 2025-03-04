"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "@/components/navigation/link";
import { useTheme } from "next-themes";

interface LinkItem {
  href: string;
  label: string;
}

interface DropdownMenuProps {
  label: string;
  links: LinkItem[];
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ label, links }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        {label} <ChevronDown />
      </button>
      {isOpen && (
        <ul
          className={`absolute right-0 mt-2 w-48 shadow-lg ${
            theme === "dark"
              ? "bg-gray-50 text-white"
              : "bg-white text-gray-800"
          }`}
        >
          {links.map((link, index) => (
            <li key={index}>
              <Link
                href={link.href}
                className={`block px-4 py-2 ${
                  theme === "dark"
                    ? "text-white hover:bg-gray-100"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropdownMenu;
