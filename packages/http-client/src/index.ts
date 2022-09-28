import fetch from "isomorphic-fetch";
import type { Includes, Project } from "./index.d";

export const loadProject = async ({
  apiUrl,
  projectId,
  include = { tree: true, props: true, breakpoints: true },
}: {
  apiUrl: string;
  projectId: string;
  include?: Includes<boolean>;
}): Promise<Project> => {
  try {
    const baseUrl = new URL(apiUrl);
    const treeUrl = new URL(`/rest/tree/${projectId}`, baseUrl);
    const propsUrl = new URL(`/rest/props/${projectId}`, baseUrl);
    const breakpointsUrl = new URL(`/rest/breakpoints/${projectId}`, baseUrl);

    const [tree, props, breakpoints] = await Promise.all([
      include.tree && (await fetch(treeUrl)).json(),
      include.props && (await fetch(propsUrl)).json(),
      include.breakpoints && (await fetch(breakpointsUrl)).json(),
    ]);
    return {
      tree,
      props,
      breakpoints,
    };
  } catch (error: any) {
    if (error instanceof Error) {
      return {
        errors: error.message,
      };
    }
    if (error?.message === "Invalid URL") {
      return { errors: "Invalid URL" };
    }
    return { errors: "Unexpected error" };
  }
};
