import Chat from "@/components/new-site/chat/chat";
import PageHeader from "@/components/new-site/content/page-header";

export const metadata = { title: "Chat" };

export default function ChatPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Chat" description="My AI Agent Chat." />
      <Chat />
    </div>
  );
}
