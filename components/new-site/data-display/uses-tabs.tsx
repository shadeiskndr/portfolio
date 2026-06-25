"use client";

import { useState } from "react";
import UsesTable, { type UsesSection } from "@/components/new-site/content/uses-table";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { USES_RIGS, USES_SHARED } from "@/lib/new-site/data";

export default function UsesTabs() {
  const [active, setActive] = useState(USES_RIGS[0].id);

  const toggle = (
    <ButtonGroup>
      {USES_RIGS.map((rig) => (
        <Button
          key={rig.id}
          type="button"
          size="sm"
          variant={active === rig.id ? "default" : "outline"}
          aria-pressed={active === rig.id}
          onClick={() => setActive(rig.id)}
        >
          {rig.label}
        </Button>
      ))}
    </ButtonGroup>
  );

  const rigRows = USES_RIGS.find((rig) => rig.id === active)?.rows ?? USES_RIGS[0].rows;
  const sections: UsesSection[] = [{ title: "PC", rows: rigRows }, ...USES_SHARED];

  return <UsesTable sections={sections} action={toggle} />;
}
