"use client";

import Sidebar from "@/components/new-site/layout/sidebar";
import MobileSheet from "./mobile-sheet";

/**
 * The profile card (avatar, socials, career, tools, quote, now-playing) as a
 * mobile sheet. On desktop the same `Sidebar` renders in the persistent left
 * column; below `lg` it lives here instead of padding out the nav drawer.
 */
export default function ProfileSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <MobileSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Profile"
      description="Who I am, where I've worked, what I use."
      // Sidebar brings its own padding, so drop the sheet's horizontal inset.
      contentClassName="px-0 pt-0"
    >
      <Sidebar />
    </MobileSheet>
  );
}
