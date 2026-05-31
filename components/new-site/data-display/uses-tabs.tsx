"use client";

import { useState } from "react";
import UsesTable, {
  type UsesRow,
  type UsesSection,
} from "@/components/new-site/content/uses-table";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

const LAPTOP_RIG: UsesRow[] = [
  {
    label: "Laptop",
    value: "Acer Nitro 5",
  },
  { label: "Processor", value: "AMD Ryzen 5 5600H with NVIDIA GTX 1650" },
  { label: "Memory", value: "32 GB DDR4" },
  { label: "OS", value: "Fedora Linux 44 (Workstation Edition)" },
];

const GAMING_RIG: UsesRow[] = [
  { label: "CPU", value: "Intel Core i5-10400F" },
  { label: "GPU", value: "MSI GeForce RTX 5070 Shadow 2X" },
  { label: "Memory", value: "32 GB DDR4" },
  { label: "Motherboard", value: "Gigabyte H410M S2 V3" },
];

const HOMELAB_RIG: UsesRow[] = [
  { label: "Thin Client", value: "Dell Wyse 5070 (N11D)" },
  { label: "Processor", value: "Intel Celeron J4105 4-Cores" },
  { label: "Memory", value: "12 GB DDR4" },
  { label: "OS", value: "Fedora Linux 44 (Server Edition)" },
];

const SHARED: UsesSection[] = [
  {
    title: "Peripherals",
    rows: [
      {
        label: "Monitors",
        value: "Philips Evnia 27 Inch QHD 300Hz • HP E273Q 27 Inch QHD 60Hz",
      },
      { label: "Keyboard", value: "Keychron K2" },
      { label: "Mouse", value: "Attack Shark X6 • Logitech G304" },
      { label: "Headset", value: "Logitech PRO X2" },
    ],
  },
  {
    title: "Software",
    rows: [{ label: "IDE", value: "Visual Studio Code" }],
  },
];

const RIGS = [
  { id: "laptop", label: "Laptop", rows: LAPTOP_RIG },
  { id: "gaming-rig", label: "Gaming Rig", rows: GAMING_RIG },
  { id: "homelab", label: "Homelab", rows: HOMELAB_RIG },
];

export default function UsesTabs() {
  const [active, setActive] = useState("laptop");

  const toggle = (
    <ButtonGroup>
      {RIGS.map((rig) => (
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

  const rigRows = RIGS.find((rig) => rig.id === active)?.rows ?? LAPTOP_RIG;
  const sections: UsesSection[] = [{ title: "PC", rows: rigRows }, ...SHARED];

  return <UsesTable sections={sections} action={toggle} />;
}
