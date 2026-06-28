export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: serialized from typed schema objects, never user input
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
