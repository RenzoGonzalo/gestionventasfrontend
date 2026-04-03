export const UNIT_TYPES = [
  { value: "UND", label: "Unidad (UND)" },
  { value: "KGS", label: "Kilogramos (KGS)" },
  { value: "MTS", label: "Metros (MTS)" },
  { value: "BOL", label: "Bolsas (BOL)" },
  { value: "LTS", label: "Litros (LTS)" },
  { value: "GLB", label: "Global (GLB)" }
] as const;

export type UnitTypeValue = (typeof UNIT_TYPES)[number]["value"];

export function apiMessage(error: unknown, fallback: string) {
  return (error as any)?.response?.data?.message ?? fallback;
}
