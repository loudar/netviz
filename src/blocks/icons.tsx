import * as LucideIcons from "lucide-react";
import { Box, type LucideIcon } from "lucide-react";

export type IconName = string;

function toPascal(name: string): string {
  return name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

const LEGACY_MAP: Record<string, string> = {
  server: "Server",
  database: "Database",
  firewall: "Shield",
  container: "Container",
  loadbalancer: "Scale",
  proxy: "TrendingUpDown",
  cloud: "Cloud",
  globe: "Globe",
  laptop: "Laptop",
  smartphone: "Smartphone",
  cpu: "Cpu",
  disk: "HardDrive",
  wifi: "Wifi",
  lock: "Lock",
  users: "Users",
  box: "Box",
  layers: "Layers",
  zap: "Zap",
  key: "KeyRound",
};

function isIconComponent(v: unknown): v is LucideIcon {
  return (
    v !== null &&
    typeof v === "object" &&
    "$$typeof" in (v as object) &&
    "render" in (v as object)
  );
}

export function resolveIcon(name: string | undefined): LucideIcon {
  if (!name) return Box;
  const lib = LucideIcons as Record<string, unknown>;
  const direct = lib[name];
  if (isIconComponent(direct)) return direct;
  const legacy = LEGACY_MAP[name];
  if (legacy && isIconComponent(lib[legacy])) return lib[legacy] as LucideIcon;
  const pascal = toPascal(name);
  if (isIconComponent(lib[pascal])) return lib[pascal] as LucideIcon;
  return Box;
}

export const LUCIDE_ICON_NAMES: string[] = Object.keys(LucideIcons)
  .filter((k) => {
    if (!/^[A-Z]/.test(k) || k.endsWith("Icon")) return false;
    const v = (LucideIcons as Record<string, unknown>)[k];
    if (!isIconComponent(v)) return false;
    const display = (v as { displayName?: string }).displayName;
    return !display || display === k;
  })
  .sort();
