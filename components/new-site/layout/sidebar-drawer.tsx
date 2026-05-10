"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import Sidebar from "@/components/new-site/layout/sidebar";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

export default function SidebarDrawer() {
  const [open, setOpen] = useState(false);
  return (
    <Drawer open={open} onOpenChange={setOpen} direction="left">
      <DrawerTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
      </DrawerTrigger>
      <DrawerContent className="overflow-y-auto">
        <DrawerTitle className="sr-only">Navigation</DrawerTitle>
        <Sidebar />
      </DrawerContent>
    </Drawer>
  );
}
