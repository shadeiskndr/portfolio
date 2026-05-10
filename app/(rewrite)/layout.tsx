export default function RewriteLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex min-h-screen w-full flex-col">{children}</main>;
}
