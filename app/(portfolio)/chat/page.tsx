import Chat from "@/components/new-site/chat/chat";

export const metadata = { title: "Chat" };

export default function ChatPage() {
  return (
    <div className="mx-auto -mb-(--dock-clearance) flex max-w-2xl flex-1 flex-col">
      <Chat />
    </div>
  );
}
