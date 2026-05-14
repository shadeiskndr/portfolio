"use client";

import * as React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

const ROOT_NAME = "ResponsiveDialog";

const ResponsiveDialogContext = React.createContext<{ isMobile: boolean } | null>(null);

function useResponsiveDialog() {
  const ctx = React.useContext(ResponsiveDialogContext);
  if (!ctx) {
    throw new Error(`\`useResponsiveDialog\` must be used within \`${ROOT_NAME}\``);
  }
  return ctx;
}

interface ResponsiveDialogProps {
  breakpoint?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

function ResponsiveDialog({
  breakpoint = 768,
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  children,
}: ResponsiveDialogProps) {
  const isMobile = useMediaQuery(`(max-width: ${breakpoint - 1}px)`);
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const value = React.useMemo(() => ({ isMobile }), [isMobile]);

  return (
    <ResponsiveDialogContext.Provider value={value}>
      {isMobile ? (
        <Drawer open={open} onOpenChange={handleOpenChange}>
          {children}
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          {children}
        </Dialog>
      )}
    </ResponsiveDialogContext.Provider>
  );
}

type TriggerProps = React.ComponentProps<"button"> & { asChild?: boolean };

function ResponsiveDialogTrigger({ asChild, children, ...props }: TriggerProps) {
  const { isMobile } = useResponsiveDialog();
  if (isMobile) {
    return (
      <DrawerTrigger data-variant="drawer" asChild={asChild} {...props}>
        {children}
      </DrawerTrigger>
    );
  }
  if (asChild && React.isValidElement(children)) {
    return <DialogTrigger data-variant="dialog" render={children} {...props} />;
  }
  return (
    <DialogTrigger data-variant="dialog" {...props}>
      {children}
    </DialogTrigger>
  );
}

function ResponsiveDialogClose({ asChild, children, ...props }: TriggerProps) {
  const { isMobile } = useResponsiveDialog();
  if (isMobile) {
    return (
      <DrawerClose data-variant="drawer" asChild={asChild} {...props}>
        {children}
      </DrawerClose>
    );
  }
  if (asChild && React.isValidElement(children)) {
    return <DialogClose data-variant="dialog" render={children} {...props} />;
  }
  return (
    <DialogClose data-variant="dialog" {...props}>
      {children}
    </DialogClose>
  );
}

function ResponsiveDialogPortal({ children }: { children?: React.ReactNode }) {
  const { isMobile } = useResponsiveDialog();
  if (isMobile) {
    return <DrawerPortal data-slot="responsive-dialog-portal">{children}</DrawerPortal>;
  }
  return <DialogPortal>{children}</DialogPortal>;
}

function ResponsiveDialogOverlay({ className, ...props }: React.ComponentProps<"div">) {
  const { isMobile } = useResponsiveDialog();
  if (isMobile) {
    return <DrawerOverlay data-variant="drawer" className={className} {...props} />;
  }
  return <DialogOverlay data-variant="dialog" className={className} {...props} />;
}

function ResponsiveDialogContent({ className, children, ...props }: React.ComponentProps<"div">) {
  const { isMobile } = useResponsiveDialog();
  if (isMobile) {
    return (
      <DrawerContent data-variant="drawer" className={cn("px-4 pb-4", className)} {...props}>
        {children}
      </DrawerContent>
    );
  }
  return (
    <DialogContent data-variant="dialog" className={className} {...props}>
      {children}
    </DialogContent>
  );
}

function ResponsiveDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { isMobile } = useResponsiveDialog();
  return isMobile ? (
    <DrawerHeader data-variant="drawer" className={className} {...props} />
  ) : (
    <DialogHeader data-variant="dialog" className={className} {...props} />
  );
}

function ResponsiveDialogFooter({
  className,
  showCloseButton,
  ...props
}: React.ComponentProps<"div"> & { showCloseButton?: boolean }) {
  const { isMobile } = useResponsiveDialog();
  if (isMobile) {
    return <DrawerFooter data-variant="drawer" className={className} {...props} />;
  }
  return (
    <DialogFooter
      data-variant="dialog"
      className={className}
      showCloseButton={showCloseButton}
      {...props}
    />
  );
}

function ResponsiveDialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
  const { isMobile } = useResponsiveDialog();
  return isMobile ? (
    <DrawerTitle data-variant="drawer" className={className} {...props} />
  ) : (
    <DialogTitle data-variant="dialog" className={className} {...props} />
  );
}

function ResponsiveDialogDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { isMobile } = useResponsiveDialog();
  return isMobile ? (
    <DrawerDescription data-variant="drawer" className={className} {...props} />
  ) : (
    <DialogDescription data-variant="dialog" className={className} {...props} />
  );
}

export {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogOverlay,
  ResponsiveDialogPortal,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
};
