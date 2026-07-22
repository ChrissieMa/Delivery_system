const PLACEHOLDER_VALUES = new Set([
  "",
  "n/a",
  "na",
  "none",
  "nil",
  "不適用",
  "沒有",
  "冇",
  "無",
]);

const GENERIC_PRODUCT_VALUES = new Set([
  "displaybox",
  "displaybox展示盒",
  "展示盒",
  "displaycase",
  "displaycase展示櫃",
  "展示櫃",
]);

const normalise = (value: unknown) => String(value || "")
  .trim()
  .toLowerCase()
  .replace(/[\s_\-—–・:：]+/g, "");

const isPlaceholder = (value: unknown) => PLACEHOLDER_VALUES.has(String(value || "").trim().toLowerCase());

const isGenericProductText = (value: unknown) => GENERIC_PRODUCT_VALUES.has(normalise(value));

export function cleanLabelDescription(rawValue: unknown, itemType?: unknown, forWhat?: unknown): string {
  if (isPlaceholder(rawValue) || isGenericProductText(rawValue)) return "";

  const itemTypeKey = normalise(itemType);
  const forWhatKey = normalise(forWhat);

  return String(rawValue || "")
    .split(/[\/／\n]+/)
    .map((part) => part.trim())
    .filter((part) => {
      if (isPlaceholder(part) || isGenericProductText(part)) return false;
      const key = normalise(part);
      return key !== itemTypeKey && key !== forWhatKey;
    })
    .join("／");
}

function cleanProductName(value: unknown): string {
  if (isPlaceholder(value) || isGenericProductText(value)) return "";
  return String(value || "").trim();
}

export function buildLabelItemDetails(orderItems: any[]) {
  return (orderItems || []).map((item: any) => {
    const f = item.fields || {};
    const rawType = String(f["Item Type"] || "");
    const baseItemType = rawType.includes("Display Case") ? "Display Case" : "Display Box";
    const productName = cleanProductName(f["For What"]);
    const accessories = Array.isArray(f.Accessories)
      ? f.Accessories.map(String)
      : String(f.Accessories || "").split(/[,，;\n]+/).map((value) => value.trim()).filter(Boolean);

    return {
      key: item.id,
      itemType: productName ? `${baseItemType}｜${productName}` : baseItemType,
      dimensions: `${f["Inter L"] || "-"} × ${f["Inter D"] || "-"} × ${f["Inter H"] || "-"}cm`,
      levels: f["No. of Levels"] ? `${f["No. of Levels"]}層${f["Level Heights"] ? `｜層高 ${f["Level Heights"]}` : ""}` : "",
      accessories,
      description: cleanLabelDescription(f.Description, f["Item Type"], f["For What"]),
    };
  });
}
