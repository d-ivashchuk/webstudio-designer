import * as React from "react";
import { IconProps } from "./types";

export const MenuIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ color = "currentColor", ...props }, forwardedRef) => {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        ref={forwardedRef}
      >
        <path
          d="M4 8C4 8.82843 3.32843 9.5 2.5 9.5C1.67157 9.5 1 8.82843 1 8C1 7.17157 1.67157 6.5 2.5 6.5C3.32843 6.5 4 7.17157 4 8Z"
          fill={color}
        />
        <path
          d="M9.5 8C9.5 8.82843 8.82843 9.5 8 9.5C7.17157 9.5 6.5 8.82843 6.5 8C6.5 7.17157 7.17157 6.5 8 6.5C8.82843 6.5 9.5 7.17157 9.5 8Z"
          fill={color}
        />
        <path
          d="M15 8C15 8.82843 14.3284 9.5 13.5 9.5C12.6716 9.5 12 8.82843 12 8C12 7.17157 12.6716 6.5 13.5 6.5C14.3284 6.5 15 7.17157 15 8Z"
          fill={color}
        />
      </svg>
    );
  }
);

MenuIcon.displayName = "MenuIcon";
