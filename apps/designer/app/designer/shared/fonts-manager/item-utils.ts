import { Asset } from "@webstudio-is/asset-uploader";
import { SYSTEM_FONTS } from "@webstudio-is/fonts";
import { matchSorter } from "match-sorter";
import { PreviewAsset } from "../assets";

export type Item = {
  label: string;
  type: "uploaded" | "system";
};

export const toItems = (assets: Array<Asset | PreviewAsset>): Array<Item> => {
  const system = Array.from(SYSTEM_FONTS.keys()).map((label) => ({
    label,
    type: "system",
  }));
  // We can have 2+ assets with the same family name, so we use a map to dedupe.
  const uploaded = new Map();
  for (const asset of assets) {
    // @todo need to teach ts the right type from useAssets
    if ("meta" in asset && "family" in asset.meta) {
      uploaded.set(asset.meta.family, {
        label: asset.meta.family,
        type: "uploaded",
      });
    }
  }
  return [...uploaded.values(), ...system];
};

export const filterIdsByFamily = (
  family: string,
  assets: Array<Asset | PreviewAsset>
) => {
  // One family may have multiple assets for different formats, so we need to find them all.
  return assets
    .filter(
      (asset) =>
        // @todo need to teach TS the right type from useAssets
        "meta" in asset &&
        "family" in asset.meta &&
        asset.meta.family === family
    )
    .map((asset) => asset.id);
};

export const groupItemsByType = (items: Array<Item>) => {
  const uploadedItems = items.filter((item) => item.type === "uploaded");
  const systemItems = items.filter((item) => item.type === "system");
  const groupedItems = [...uploadedItems, ...systemItems];
  return { uploadedItems, systemItems, groupedItems };
};

export const filterItems = (search: string, items: Array<Item>) => {
  return matchSorter(items, search, {
    keys: [(item) => item.label],
  });
};
