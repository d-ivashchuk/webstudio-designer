import { getBuildParams, getBuildOrigin } from "./build-params";

const makeRequest = (url: string) => ({
  url,
  headers: {
    get: (name: string) => {
      if (name === "host" || name === "x-forwarded-host") {
        return new URL(url).host;
      }
      return null;
    },
  },
});

describe("getBuildOrigin", () => {
  test("Normal operation", () => {
    expect(
      getBuildOrigin(makeRequest("https://bar.com"), {
        ...process.env,
        BUILD_ORIGIN: "https://foo.com",
      })
    ).toBe("https://foo.com");
  });

  test("Local development", () => {
    const env = { NODE_ENV: "development" } as const;
    expect(getBuildOrigin(makeRequest("http://localhost"), env)).toBe(
      "http://localhost"
    );
    expect(getBuildOrigin(makeRequest("http://localhost:1234"), env)).toBe(
      "http://localhost:1234"
    );
    expect(getBuildOrigin(makeRequest("http://foo.localhost:1234"), env)).toBe(
      "http://localhost:1234"
    );
  });

  test("Vercel preview", () => {
    const env = {
      ...process.env,
      VERCEL_ENV: "preview",
      VERCEL_URL: "bar.foo.com",
    };
    expect(getBuildOrigin(makeRequest("https://baz.com"), env)).toBe(
      "https://bar.foo.com"
    );
  });
});

describe("getCanvasRequestParams", () => {
  const env = {
    ...process.env,
    BUILD_ORIGIN: "https://foo.com",
  };

  test("detects project domain", () => {
    const request = makeRequest("https://bar.foo.com");
    expect(
      (getBuildParams(request, env) as { projectDomain: string }).projectDomain
    ).toBe("bar");
  });

  test("doesn't detect project domain if base domain is not a user content domain", () => {
    const request = makeRequest("https://bar.baz.com");
    expect(getBuildParams(request, env)).toBeUndefined();
  });

  test("detects project id", () => {
    const request = makeRequest("https://foo.com?projectId=123");
    expect(
      (getBuildParams(request, env) as { projectId: string }).projectId
    ).toBe("123");
  });

  test("doesn't detect project id if domain is not a user content domain", () => {
    const request = makeRequest("https://baz.com?projectId=123");
    expect(getBuildParams(request, env)).toBeUndefined();
  });

  test("doesn't detect project id if BUILD_REQUIRE_SUBDOMAIN is true", () => {
    const request = makeRequest("https://foo.com?projectId=123");
    expect(
      getBuildParams(request, { BUILD_REQUIRE_SUBDOMAIN: "true", ...env })
    ).toBeUndefined();
  });

  test("detects path", () => {
    expect(
      getBuildParams(makeRequest("https://bar.foo.com"), env)?.pathname
    ).toBe("/");
    expect(
      getBuildParams(makeRequest("https://bar.foo.com/abc"), env)?.pathname
    ).toBe("/abc");
    expect(
      getBuildParams(makeRequest("https://bar.foo.com/abc/123"), env)?.pathname
    ).toBe("/abc/123");
  });

  test("detects mode", () => {
    expect(
      getBuildParams(makeRequest("https://bar.foo.com?mode=edit"), env)?.mode
    ).toBe("edit");
    expect(
      getBuildParams(makeRequest("https://bar.foo.com?mode=preview"), env)?.mode
    ).toBe("preview");
    expect(getBuildParams(makeRequest("https://bar.foo.com"), env)?.mode).toBe(
      "published"
    );
  });
});
