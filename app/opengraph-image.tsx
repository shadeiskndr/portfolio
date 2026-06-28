import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const publicDir = path.join(process.cwd(), "public");
  const [lastoria, liberation] = await Promise.all([
    readFile(path.join(publicDir, "LastoriaBoldRegular.otf")),
    // Synced from pdfjs-dist by the prebuild sync:pdfjs script.
    readFile(path.join(publicDir, "pdfjs", "standard_fonts", "LiberationSans-Regular.ttf")),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a0a0a",
        color: "#fafafa",
        fontFamily: "Liberation Sans",
        gap: 36,
      }}
    >
      <div style={{ fontFamily: "Lastoria", fontSize: 48, whiteSpace: "nowrap" }}>
        Shahathir Iskandar
      </div>
      <div style={{ fontSize: 30, color: "#a1a1aa" }}>
        Software developer · Batu Caves, Selangor, Malaysia
      </div>
      <div style={{ fontSize: 24, color: "#71717a" }}>shahathir.me</div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Lastoria", data: lastoria, style: "normal", weight: 700 },
        { name: "Liberation Sans", data: liberation, style: "normal", weight: 400 },
      ],
    }
  );
}
