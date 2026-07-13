"use client";

import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import DrawerNav from "@/components/new-site/layout/drawer-nav";
import ProfileSheet from "@/components/new-site/layout/profile-sheet";
import ThemeControls from "@/components/new-site/layout/theme-controls";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

// Long enough for the drawer's 0.5s slide-out to be visibly under way before
// the sheet starts rising, short enough that the handoff still feels like one
// gesture. Also keeps the two vaul roots from fighting over the body scroll
// lock, which they do if the second opens while the first is still mounted.
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
          {/* Profile is a handoff rather than a stacked sheet: it is a whole
              page of content, so the drawer steps out of its way. The control
              row below opens smaller sheets that sit on top instead. */}
          <DrawerNav
            onNavigate={() => setOpen(false)}
            onOpenProfile={() => {
              setOpen(false);
              handoff.current = setTimeout(() => setProfileOpen(true), HANDOFF_MS);
            }}
          />
          <div className="mt-1 flex items-center gap-1 px-4 pb-3">
            <ThemeControls variant="drawer" />
          </div>
        </DrawerContent>
      </Drawer>
      <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
