import { renderHook, act } from "@testing-library/react-hooks";
import { DropTarget, Placement } from "../primitives/dnd";
import { useHorizontalShift } from "./horizontal-shift";
import {
  canAcceptChild,
  getItemChildren,
  getItemPath,
  getItemPathWithPositions,
  Item,
} from "./test-tree-data";

const box1: Item = { canAcceptChildren: true, id: "box1", children: [] };
const box2: Item = { canAcceptChildren: true, id: "box2", children: [] };
const box321: Item = { canAcceptChildren: true, id: "box321", children: [] };
const box32: Item = {
  canAcceptChildren: true,
  children: [box321],
  id: "box32",
};
const box31: Item = { canAcceptChildren: true, id: "box31", children: [] };
const box3: Item = {
  canAcceptChildren: true,
  children: [box31, box32],
  id: "box3",
};
const box4: Item = { canAcceptChildren: true, id: "box4", children: [] };
const heading: Item = {
  canAcceptChildren: false,
  children: [{ canAcceptChildren: false, id: "bold", children: [] }],
  id: "heading",
};
const box511: Item = { canAcceptChildren: true, id: "box511", children: [] };
const box51: Item = {
  canAcceptChildren: true,
  id: "box51",
  children: [box511],
};
const box52: Item = { canAcceptChildren: true, id: "box52", children: [] };
const box5: Item = {
  canAcceptChildren: true,
  id: "box5",
  children: [box51, box52],
};

// root
// | box1
// | box2
// | box3
// | | box31
// | | box32
// | | | box321
// | box4
// | heading
// | | bold
// | box5
// | | box51
// | | | box511
// | | box52
const tree: Item = {
  id: "root",
  canAcceptChildren: true,
  children: [box1, box2, box3, box4, heading, box5],
};

const makePlacement = (
  type: Placement["type"] = "next-to-child"
): Placement => ({
  type,
  direction: "horizontal",
  x: 0,
  y: 100,
  length: 300,
});

const makeDrop = ({
  into,
  after,
  placement = makePlacement(),
}: {
  into: Item;
  after?: Item;
  placement?: Placement;
}): DropTarget<Item> => ({
  data: into,
  indexWithinChildren:
    after === undefined ? 0 : into.children.indexOf(after) + 1,
  placement,

  // not used
  element: null as unknown as HTMLElement,
  rect: null as unknown as DOMRect,
});

const render = (
  {
    dragItem,
    dropTarget,
  }: {
    dragItem: Item | undefined;
    dropTarget: DropTarget<Item> | undefined;
  },
  shift = -1
) => {
  const { result } = renderHook((props) => useHorizontalShift<Item>(props), {
    initialProps: {
      dragItem,
      dropTarget,
      root: tree,
      getIsExpanded: (item: Item) => item.children.length > 0,
      canAcceptChild,
      getItemChildren,
      getItemPath,
      getItemPathWithPositions,
    },
  });

  act(() => {
    const [, setHorizontalShift] = result.current;
    setHorizontalShift(shift);
  });

  const [shiftedDroptTarget] = result.current;
  return shiftedDroptTarget;
};

test("if there's no dragItem or dropTarget returns undefined", () => {
  const result = render({
    dragItem: undefined,
    dropTarget: undefined,
  });
  expect(result).toBeUndefined();
});

test("drop target is empty or collapsed", () => {
  const dropTarget = makeDrop({
    into: box2,
    placement: makePlacement("inside-parent"),
  });
  const result = render({ dragItem: box1, dropTarget });

  // parent doesn't change
  expect(result?.item.id).toBe(box2.id);

  // placement line geometry isn't provided
  expect(result?.placement).toBeUndefined();
});

test("placement line coordinates are always adjusted", () => {
  const result = render(
    { dragItem: box31, dropTarget: makeDrop({ into: box3, after: box32 }) },
    0
  );

  // parent doesn't change
  expect(result?.item.id).toBe(box3.id);

  // placement line is adjusted to account for depth,
  // even though depth didn't change
  expect(result?.placement).toEqual({
    ...makePlacement(),
    length: 260,
    x: 40,
  });
});

test("shifting is relative to the drag item's depth", () => {
  // same shift and drop target
  const shift = 0;
  const dropTarget = makeDrop({ into: tree, after: box3 });

  // box2's depth is 1, so it's inserted without shifting
  const result1 = render({ dragItem: box2, dropTarget }, shift);
  expect(result1?.item.id).toBe(tree.id);

  // box31's depth is 2, so it's inserted with shifting, to maintain the same depth
  const result2 = render({ dragItem: box31, dropTarget }, shift);
  expect(result2?.item.id).toBe(box3.id);
  expect(result2?.position).toBe("end");
});

describe("shifting to the left", () => {
  test("if we're already at the root, no shift occurs", () => {
    const result = render(
      { dragItem: box1, dropTarget: makeDrop({ into: tree, after: box2 }) },
      -1
    );
    expect(result?.item.id).toBe(tree.id);
  });

  test("a shifting is possible only when we're at the bottom of the initial drop target", () => {
    const result1 = render(
      { dragItem: box1, dropTarget: makeDrop({ into: box3, after: box31 }) },
      -1
    );
    expect(result1?.item.id).toBe(box3.id);
  });

  test("when above the drag item, which is at the bottom, the shift is allowed", () => {
    const result = render(
      { dragItem: box32, dropTarget: makeDrop({ into: box3, after: box31 }) },
      -1
    );
    expect(result?.item.id).toBe(tree.id);
    expect(result?.position).toBe(tree.children.indexOf(box3) + 1);
    expect(result?.placement).toEqual({
      ...makePlacement(),
      x: 24,
      length: 276,
    });
  });

  test("shifting by different ammounts works correctly", () => {
    const args = {
      dragItem: box1,
      dropTarget: makeDrop({ into: box32, after: box321 }),
    };

    const result1 = render(args, 0);
    expect(result1?.item.id).toBe(tree.id);
    expect(result1?.position).toBe(tree.children.indexOf(box3) + 1);
    expect(result1?.placement).toEqual({
      ...makePlacement(),
      x: 24,
      length: 276,
    });

    const result2 = render(args, 1);
    expect(result2?.item.id).toBe(box3.id);
    expect(result2?.position).toBe(box3.children.indexOf(box32) + 1);
    expect(result2?.placement).toEqual({
      ...makePlacement(),
      x: 40,
      length: 260,
    });
  });

  test('the "at the bottom" check is perforamed at every step, dissalowing futher shifting when we\'re no longer at the bottom', () => {
    const result = render(
      {
        dragItem: box1,
        dropTarget: makeDrop({ into: box51, after: box511 }),
      },
      -10
    );
    expect(result?.item.id).toBe(box5.id);
    expect(result?.position).toBe(box5.children.indexOf(box51) + 1);
  });
});

describe("shifting to the right ", () => {
  test("if there's no expanded item above, no shift occurs", () => {
    const result = render(
      { dragItem: box1, dropTarget: makeDrop({ into: tree, after: box2 }) },
      1
    );
    expect(result?.item.id).toBe(tree.id);
  });

  test("if there's an expanded item above, we shift inside it", () => {
    const args = {
      dragItem: box1,
      dropTarget: makeDrop({ into: tree, after: box3 }),
    };

    const result1 = render(args, 1);
    expect(result1?.item.id).toBe(box3.id);

    const result2 = render(args, 2);
    expect(result2?.item.id).toBe(box32.id);
  });

  test("you cannot move inside drag item by shifting", () => {
    // drag item is right above, no shifting
    const result1 = render(
      { dragItem: box3, dropTarget: makeDrop({ into: tree, after: box3 }) },
      3
    );
    expect(result1?.item.id).toBe(tree.id);

    // drag item is inside the item above
    // we shift into the item above, but not inside the drag item
    const result2 = render(
      { dragItem: box32, dropTarget: makeDrop({ into: tree, after: box3 }) },
      3
    );
    expect(result2?.item.id).toBe(box3.id);
    expect(result2?.position).toBe("end");
  });

  test("when the item above is the drag item itself, we consider the item above it as a potential target", () => {
    const result = render(
      { dragItem: box4, dropTarget: makeDrop({ into: tree, after: box4 }) },
      1
    );
    expect(result?.item.id).toBe(box3.id);
    expect(result?.position).toBe("end");
  });

  test("if there's an expanded item above, but it cannot accept shildren, no shift occurs", () => {
    const result = render(
      {
        dragItem: box1,
        dropTarget: makeDrop({ into: tree, after: heading }),
      },
      1
    );
    expect(result?.item.id).toBe(tree.id);
  });
});
