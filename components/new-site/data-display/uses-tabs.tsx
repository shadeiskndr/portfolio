"use client";

import { useCallback, useState } from "react";
import UsesTable, { type UsesSection } from "@/components/new-site/content/uses-table";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { USES_RIGS, USES_SHARED } from "@/lib/new-site/data";

function RigButton({
  rig,
  active,
  onSelect,
}: {
  rig: (typeof USES_RIGS)[number];
  active: boolean;
  onSelect: (id: (typeof USES_RIGS)[number]["id"]) => void;
}) {
  const handleClick = useCallback(() => onSelect(rig.id), [onSelect, rig.id]);

  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "outline"}
      aria-pressed={active}
      onClick={handleClick}
    >
      {rig.label}
    </Button>
  );
}

export default function UsesTabs() {
  const [active, setActive] = useState(USES_RIGS[0].id);

  const toggle = (
    <ButtonGroup>
      {USES_RIGS.map((rig) => (
        <RigButton key={rig.id} rig={rig} active={active === rig.id} onSelect={setActive} />
      ))}
    </ButtonGroup>
  );

  const rigRows = USES_RIGS.find((rig) => rig.id === active)?.rows ?? USES_RIGS[0].rows;
  const sections: UsesSection[] = [{ title: "PC", rows: rigRows }, ...USES_SHARED];

  return <UsesTable sections={sections} action={toggle} />;
}
