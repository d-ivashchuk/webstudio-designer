import {
  styled,
  keyframes,
  Collapsible,
  Box,
} from "@webstudio-is/design-system";

const CollapsibleRoot = styled(Collapsible.Root, {
  position: "absolute",
  left: "100%",
  top: 0,
  bottom: 0,
  display: "flex",
  flexDirection: "column",
  marginLeft: 1,
});

const openKeyframes = keyframes({
  from: {
    opacity: 0.5,
    transform: "translateX(-$spacing$30)",
  },
  to: {
    transform: "translateX(0)",
    opacity: 1,
  },
});

const closeKeyframes = keyframes({
  from: {
    transform: "translateX(0)",
    opacity: 1,
  },
  to: {
    opacity: 0.2,
    transform: "translateX(-$spacing$30)",
  },
});

const CollapsibleContent = styled(Collapsible.Content, {
  overflow: "hidden",
  flexGrow: "1",
  display: "flex",
  flexDirection: "column",
  '&[data-state="open"]': {
    animation: `${openKeyframes} 200ms $easing$easeOutQuart`,
  },
  '&[data-state="closed"]': {
    animation: `${closeKeyframes} 200ms $easing$easeOutQuart`,
  },
});

export const SettingsPanel = ({
  children,
  isOpen,
}: {
  children: React.ReactNode;
  isOpen: boolean;
}) => {
  return (
    <CollapsibleRoot open={isOpen}>
      <CollapsibleContent>
        <Box
          css={{
            flexGrow: 1,
            width: "$spacing$35",
            background: "$loContrast",
            borderRight: "1px solid $slate7",
            position: "relative",
          }}
        >
          {children}
        </Box>
      </CollapsibleContent>
    </CollapsibleRoot>
  );
};
