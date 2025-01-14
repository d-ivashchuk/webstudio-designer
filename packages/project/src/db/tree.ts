import { type Tree, Instance } from "@webstudio-is/react-sdk";
import { applyPatches, type Patch } from "immer";
import { prisma } from "@webstudio-is/prisma-client";
import { Tree as DbTree } from "@prisma/client";
import { utils } from "../index";
import type { Breakpoint } from "@webstudio-is/css-data";

export const createRootInstance = (breakpoints: Array<Breakpoint>) => {
  // Take the smallest breakpoint as default
  const defaultBreakpoint = utils.breakpoints.sort(breakpoints)[0];
  if (defaultBreakpoint === undefined) {
    throw new Error("A breakpoint with minWidth 0 is required");
  }
  const instance = utils.tree.createInstance({ component: "Body" });
  return utils.tree.populateInstance(instance, defaultBreakpoint.id);
};

export const create = async (root: Instance): Promise<DbTree> => {
  Instance.parse(root);
  const rootString = JSON.stringify(root);
  return await prisma.tree.create({
    data: { root: rootString },
  });
};

export const deleteById = async (treeId: string): Promise<void> => {
  await prisma.tree.delete({ where: { id: treeId } });
};

export const loadById = async (treeId: string): Promise<Tree | null> => {
  const tree = await prisma.tree.findUnique({
    where: { id: treeId },
  });

  if (tree === null) return null;

  const root = JSON.parse(tree.root);
  Instance.parse(root);
  return {
    ...tree,
    root,
  };
};

export const clone = async (treeId: string) => {
  const tree = await loadById(treeId);
  if (tree === null) {
    throw new Error(`Tree ${treeId} not found`);
  }
  return await create(tree.root);
};

export const patchRoot = async (
  { treeId }: { treeId: Tree["id"] },
  patches: Array<Patch>
) => {
  const tree = await loadById(treeId);
  if (tree === null) {
    throw new Error(`Tree ${treeId} not found`);
  }
  const root = applyPatches(tree.root, patches);
  Instance.parse(root);
  await prisma.tree.update({
    data: { root: JSON.stringify(root) },
    where: { id: treeId },
  });
};
