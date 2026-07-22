export const accessoriesOf = (item: any): string[] => {
  const raw = item?.fields?.Accessories;
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  return String(raw || "").split(/[,，;\n]+/).map((value) => value.trim()).filter(Boolean);
};

export const hasLight = (item: any) => accessoriesOf(item).some((value) => value.includes("燈"));

export const positiveNumber = (value: unknown): number | undefined => {
  const candidate = Array.isArray(value) ? value[0] : value;
  const parsed = Number(candidate);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

export const chinaFreightWeight = (item: any) => positiveNumber(item?.fields?.["China Freight Weight Input KG"]);

export const chinaFreightPackages = (item: any) => {
  const value = positiveNumber(item?.fields?.["China Freight Piece Count"]);
  return value === undefined ? undefined : Math.max(1, Math.floor(value));
};

export const defaultBasePackages = (item: any) => {
  const fields = item.fields || {};
  const qty = Math.max(1, Number(fields.QTY) || 1);
  const isCase = String(fields["Item Type"] || "").includes("Display Case");
  const levels = Math.max(1, Number(fields["No. of Levels"]) || 1);
  return isCase ? qty * levels : qty;
};

export const totalPackagesForItems = (items: any[], basePackages: Record<string, string>) => items.reduce((sum, item) => {
  return sum + Math.max(1, Number(basePackages[item.id]) || 1) + (hasLight(item) ? 1 : 0);
}, 0);
