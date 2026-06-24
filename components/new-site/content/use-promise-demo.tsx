"use client";

import { Suspense, use, useState } from "react";
import { Button } from "@/components/ui/button";

type Profile = { name: string; team: string; commits: number };

const PEOPLE: Profile[] = [
  { name: "Ada", team: "Systems", commits: 1287 },
  { name: "Grace", team: "Compilers", commits: 964 },
  { name: "Alan", team: "Theory", commits: 512 },
  { name: "Edsger", team: "Rigor", commits: 733 },
];

let seq = 0;

// Created OUTSIDE the consuming component (in the click handler), so it's a
// stable promise — not a new one on every render that never resolves.
function loadProfile(): Promise<Profile> {
  const person = PEOPLE[seq++ % PEOPLE.length];
  return new Promise((resolve) => setTimeout(() => resolve(person), 1200));
}

function ProfileCard({ profile }: { profile: Promise<Profile> }) {
  const data = use(profile); // unwraps the promise; suspends until it resolves
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="font-semibold text-sm">{data.name}</p>
      <p className="text-muted-foreground text-xs">{data.team} team</p>
      <p className="mt-2 font-mono text-xs">{data.commits.toLocaleString()} commits</p>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-muted-foreground text-sm">
      <span className="size-3 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-transparent" />
      Suspense fallback — resolving the promise…
    </div>
  );
}

/** `use(promise)` unwrapped inside render, with Suspense handling the loading state. */
export function UsePromiseDemo() {
  const [profile, setProfile] = useState<Promise<Profile> | null>(null);

  return (
    <div className="my-6 rounded-xl border p-4">
      <Button size="sm" variant="outline" onClick={() => setProfile(loadProfile())}>
        {profile ? "Load another" : "Load profile"}
      </Button>
      <div className="mt-3 min-h-[92px]">
        {profile ? (
          <Suspense fallback={<Spinner />}>
            <ProfileCard profile={profile} />
          </Suspense>
        ) : (
          <p className="text-muted-foreground text-sm">Nothing loaded yet.</p>
        )}
      </div>
    </div>
  );
}
