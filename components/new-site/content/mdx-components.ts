import type { MDXComponents } from "next-mdx-remote-client/rsc";
import { AskUserDemo } from "@/components/new-site/content/ask-user-demo";
import { DiscriminatedUnionDemo } from "@/components/new-site/content/discriminated-union-demo";
import { EchoGuardDemo } from "@/components/new-site/content/echo-guard-demo";
import { GraphOrphanEdgesDemo } from "@/components/new-site/content/graph-orphan-edges-demo";
import { CodeMirrorDemo, SyncedChartsDemo } from "@/components/new-site/content/lazy-demos";
import {
  MdxA,
  MdxBlockquote,
  MdxCode,
  MdxH1,
  MdxH2,
  MdxH3,
  MdxHighlight,
  MdxHr,
  MdxLi,
  MdxOl,
  MdxP,
  MdxPre,
  MdxUl,
} from "@/components/new-site/content/mdx-elements";
import { Mermaid } from "@/components/new-site/content/mermaid";
import { NestedFormDemo } from "@/components/new-site/content/nested-form-demo";
import { ProfileFormDemo } from "@/components/new-site/content/profile-form-demo";
import { RuntimeThemeDemo } from "@/components/new-site/content/runtime-theme-demo";
import { StreamRevealDemo } from "@/components/new-site/content/stream-reveal-demo";
import { ToneRampDemo } from "@/components/new-site/content/tone-ramp-demo";
import { UsePromiseDemo } from "@/components/new-site/content/use-promise-demo";
import { WorkflowGraphDemo } from "@/components/new-site/content/workflow-graph-demo";

export const mdxComponents: MDXComponents = {
  Highlight: MdxHighlight,
  AskUserDemo,
  CodeMirrorDemo,
  DiscriminatedUnionDemo,
  EchoGuardDemo,
  GraphOrphanEdgesDemo,
  Mermaid,
  NestedFormDemo,
  ProfileFormDemo,
  RuntimeThemeDemo,
  StreamRevealDemo,
  SyncedChartsDemo,
  ToneRampDemo,
  UsePromiseDemo,
  WorkflowGraphDemo,
  h1: MdxH1,
  h2: MdxH2,
  h3: MdxH3,
  p: MdxP,
  a: MdxA,
  ul: MdxUl,
  ol: MdxOl,
  li: MdxLi,
  blockquote: MdxBlockquote,
  code: MdxCode,
  pre: MdxPre,
  hr: MdxHr,
};
