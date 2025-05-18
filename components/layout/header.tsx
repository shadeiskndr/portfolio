"use client";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { NAV_LINKS } from "@/lib/data";
import { cn } from "@/lib/utils";
import useWindowSize from "@/hooks/use-window-size";
import useScroll from "@/hooks/use-scroll";
import Link from "@/components/navigation/link";
import ThemeSwitcher from "@/components/general/theme-switcher";
import IconButton from "@/components/general/icon-button";
import DownloadCV from "@/components/general/download-cv";
import Typography from "@/components/general/typography";
import DropdownMenu from "@/components/navigation/dropdown-menu";

const Logo = () => (
  <Typography variant="h3" className="font-bold">
    {"</> Shahathir.me"}
  </Typography>
);

const Header = () => {
  const scrolled = useScroll(40);
  const [isOpen, setIsOpen] = useState(false);
  const size = useWindowSize();

  // close sidebar if open in screen size < 768px
  useEffect(() => {
    if (size?.width && size?.width > 1024 && isOpen) {
      setIsOpen(false);
    }
  }, [size, isOpen]);

  // Split NAV_LINKS into two groups
  const mainLinks = NAV_LINKS.slice(0, 4);
  const moreLinks = size?.width && size.width < 1024 ? NAV_LINKS.slice(4, 6) : NAV_LINKS.slice(4);

  return (
    <header
      className={cn(
        "bg-background sticky top-0 z-30 w-full border-b border-transparent",
        scrolled ? "bg-background/50 backdrop-blur-xl" : ""
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between p-4 md:px-8">
        <Link href="/" noCustomization>
          <Logo />
        </Link>
        {/* Navigation links visible on large screens */}
        <div className="hidden items-center gap-6 lg:flex">
          <ul className="flex list-none items-center gap-6">
            {mainLinks.map((link, index) => (
              <li key={index}>
                <Link href={link.href} className="text-foreground hover:text-muted-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <DropdownMenu label="More" links={moreLinks} />
            </li>
          </ul>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <DownloadCV />
          </div>
        </div>

        {/* Drawer trigger visible on small screens */}
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild className="flex lg:hidden">
            <IconButton>
              <Menu />
            </IconButton>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>
              <div className="flex items-center justify-between border-b px-4 pb-6">
                <Logo />
                <DrawerClose asChild>
                  <IconButton>
                    <X />
                  </IconButton>
                </DrawerClose>
              </div>
            </DrawerTitle>
            <div className="border-b p-4">
              <ul className="flex list-none flex-col gap-4">
                {NAV_LINKS.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      onClick={() => {
                        const timeoutId = setTimeout(() => {
                          setIsOpen(false);
                          clearTimeout(timeoutId);
                        }, 500);
                      }}
                      className="text-foreground hover:text-muted-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-4 p-4">
              <div className="flex items-center justify-between">
                <Typography>Switch Theme</Typography>
                <ThemeSwitcher />
              </div>
              <DownloadCV />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </header>
  );
};

export default Header;
