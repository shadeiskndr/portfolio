"use client";

import { Menu } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import DrawerNav from "@/components/new-site/layout/drawer-nav";
import ProfileSheet from "@/components/new-site/layout/profile-sheet";
import ThemeControls from "@/components/new-site/layout/theme-controls";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

const HANDOFF_MS = 220;

export default function SidebarDrawer() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const handoff = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (handoff.current) clearTimeout(handoff.current);
    },
    []
  );

  const handleNavigate = useCallback(() => setOpen(false), []);

  const handleOpenProfile = useCallback(() => {
    setOpen(false);
    handoff.current = setTimeout(() => setProfileOpen(true), HANDOFF_MS);
  }, []);

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen} direction="left">
        <DrawerTrigger asChild>
          <button
            type="button"
            aria-label="Open menu"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:size-8"
          >
            <Menu className="h-4 w-4" />
          </button>
        </DrawerTrigger>
        <DrawerContent className="overflow-y-auto data-[vaul-drawer-direction=left]:w-[86%] data-[vaul-drawer-direction=left]:sm:max-w-sm">
          <DrawerTitle className="sr-only">Navigation</DrawerTitle>
          <DrawerNav onNavigate={handleNavigate} onOpenProfile={handleOpenProfile} />
          <div className="mt-1 flex items-center gap-1 px-4 pb-3">
            <ThemeControls variant="drawer" />
          </div>
        </DrawerContent>
      </Drawer>
      <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
