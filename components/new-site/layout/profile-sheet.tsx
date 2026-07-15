"use client";

import Sidebar from "@/components/new-site/layout/sidebar";
import MobileSheet from "./mobile-sheet";

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
      contentClassName="px-0 pt-0"
    >
      <Sidebar />
    </MobileSheet>
  );
}
