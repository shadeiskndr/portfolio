import Chat from "@/components/new-site/chat/chat";

export const metadata = { title: "Chat" };

export default function ChatPage() {
  return (
    // Cancels the shell's bottom padding at every breakpoint (--dock-clearance
    // matches `lg:py-14` above `lg`) so the sticky composer can reach the
    // viewport edge and reserve the dock's space itself.
    <div className="mx-auto -mb-(--dock-clearance) flex max-w-2xl flex-1 flex-col">
      <Chat />
    </div>
  );
}
