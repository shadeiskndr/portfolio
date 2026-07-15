type TypstModule = typeof import("@myriaddreamin/typst.ts");

const WASM_COMPILER = "/typst/typst_ts_web_compiler_bg.wasm";
const WASM_RENDERER = "/typst/typst_ts_renderer_bg.wasm";
const FONT_URLS = [
  "/typst/fonts/XCharter-Roman.otf",
  "/typst/fonts/XCharter-Bold.otf",
  "/typst/fonts/XCharter-Italic.otf",
  "/typst/fonts/XCharter-BoldItalic.otf",
  "/typst/fonts/LiberationSans.ttf",
];

let initPromise: Promise<TypstModule> | null = null;

function ensureInit(): Promise<TypstModule> {
  if (!initPromise) {
    initPromise = (async () => {
      const m = await import("@myriaddreamin/typst.ts");
      m.$typst.setCompilerInitOptions({
        getModule: () => WASM_COMPILER,
        beforeBuild: [m.initOptions.disableDefaultFontAssets(), m.loadFonts(FONT_URLS)],
      });
      m.$typst.setRendererInitOptions({ getModule: () => WASM_RENDERER });
      return m;
    })();
  }
  return initPromise;
}

export async function compileSvg(source: string): Promise<string> {
  const m = await ensureInit();
  return m.$typst.svg({ mainContent: source });
}

export async function compilePdf(source: string): Promise<Uint8Array> {
  const m = await ensureInit();
  const bytes = await m.$typst.pdf({ mainContent: source });
  if (!bytes) throw new Error("Typst produced no PDF output.");
  return bytes;
}

export function warmTypst(): void {
  void ensureInit();
}
