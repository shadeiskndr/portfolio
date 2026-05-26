const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** A two-tone diagonal gradient with a few soft blurred blobs — abstract album art. */
export function coverSvg() {
  const h1 = Math.floor(rand(0, 360));
  const h2 = (h1 + Math.floor(rand(40, 160))) % 360;
  const blobs = Array.from({ length: 3 }, () => {
    const hue = (h1 + Math.floor(rand(-30, 30)) + 360) % 360;
    return `<circle cx="${rand(0, 400).toFixed(0)}" cy="${rand(0, 400).toFixed(0)}" r="${rand(
      80,
      180
    ).toFixed(0)}" fill="hsl(${hue} 80% 65%)" opacity="${rand(0.25, 0.45).toFixed(2)}" />`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${h1} 70% 55%)" />
      <stop offset="1" stop-color="hsl(${h2} 70% 42%)" />
    </linearGradient>
    <filter id="b"><feGaussianBlur stdDeviation="40" /></filter>
  </defs>
  <rect width="400" height="400" fill="url(#g)" />
  <g filter="url(#b)">${blobs}</g>
</svg>`;
}

/** Upload a freshly generated cover SVG to Convex storage; returns its storageId. */
export async function uploadCover(
  generateUploadUrl: () => Promise<string>
): Promise<string | null> {
  const blob = new Blob([coverSvg()], { type: "image/svg+xml" });
  const uploadUrl = await generateUploadUrl();
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "image/svg+xml" },
    body: blob,
  });
  if (!res.ok) return null;
  const { storageId } = (await res.json()) as { storageId: string };
  return storageId;
}
