import { prisma, Project } from "@webstudio-is/prisma-client";
import { Asset } from "../types";
import { formatAsset } from "../utils/format-asset";

export const loadByProject = async (
  projectId?: Project["id"]
): Promise<Asset[]> => {
  if (typeof projectId !== "string") {
    throw new Error("Project ID required");
  }

  const assets = await prisma.asset.findMany({
    where: { projectId },
    orderBy: {
      createdAt: "desc",
    },
  });

  return assets.map(formatAsset);
};
