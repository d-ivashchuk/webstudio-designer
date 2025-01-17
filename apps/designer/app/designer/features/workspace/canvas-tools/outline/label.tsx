import { useCallback, useState } from "react";
import { styled, type Rect } from "@webstudio-is/design-system";
import { type Instance, getComponentMeta } from "@webstudio-is/react-sdk";

type LabelPosition = "top" | "inside" | "bottom";
type LabelRefCallback = (element: HTMLElement | null) => void;

/**
 * Detects if there is no space on top and for the label and tells to show it inside.
 * - if there is enough space for the label on top of the instance - top
 * - else if instance height is more than 250px - bottom
 * - else inside-top - last resort because it covers a bit of the instance content
 */
const useLabelPosition = (
  instanceRect: Rect
): [LabelRefCallback, LabelPosition] => {
  const [position, setPosition] = useState<LabelPosition>("top");

  const ref = useCallback(
    (element) => {
      if (element === null || instanceRect === undefined) return;
      const labelRect = element.getBoundingClientRect();
      let nextPosition: LabelPosition = "top";
      if (labelRect.height > instanceRect.top) {
        nextPosition = instanceRect.height < 250 ? "bottom" : "inside";
      }
      setPosition(nextPosition);
    },
    [instanceRect]
  );

  return [ref, position];
};

const LabelContainer = styled(
  "div",
  {
    position: "absolute",
    display: "flex",
    padding: "0 $spacing$3",
    height: "$spacing$10",
    color: "white",
    alignItems: "center",
    justifyContent: "center",
    gap: "$spacing$3",
    fontSize: "$fontSize$3",
    fontFamily: "$sans",
    lineHeight: 1,
    minWidth: "$spacing$13",
    whiteSpace: "nowrap",
    backgroundColor: "$blue9",
  },
  {
    variants: {
      position: {
        top: {
          top: "-$spacing$10",
        },
        inside: {
          top: 0,
        },
        bottom: {
          bottom: "-$spacing$10",
        },
      },
    },
  }
);

type LabelProps = {
  component: Instance["component"];
  instanceRect: Rect;
};

export const Label = ({ component, instanceRect }: LabelProps) => {
  const [labelRef, position] = useLabelPosition(instanceRect);
  const { Icon, label } = getComponentMeta(component);
  return (
    <LabelContainer position={position} ref={labelRef}>
      <Icon width="1em" height="1em" />
      {label}
    </LabelContainer>
  );
};
