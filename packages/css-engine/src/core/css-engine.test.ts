import { CssEngine } from "./css-engine";

const style0 = {
  display: { type: "keyword", value: "block" },
} as const;

const mediaRuleOptions0 = { minWidth: 0 } as const;
const mediaId = "0";

describe("CssEngine", () => {
  let engine: CssEngine;

  beforeEach(() => {
    engine = new CssEngine();
  });

  test("use default media rule when there is no matching one registrered", () => {
    engine.addStyleRule(".c", {
      style: style0,
      breakpoint: "x",
    });
    expect(engine.cssText).toMatchInlineSnapshot(`
      "@media all {
        .c { display: block }
      }"
    `);
    engine.addStyleRule(".c1", {
      style: { color: { type: "keyword", value: "red" } },
      breakpoint: "x",
    });
    expect(engine.cssText).toMatchInlineSnapshot(`
      "@media all {
        .c { display: block }
        .c1 { color: red }
      }"
    `);

    engine.addMediaRule(mediaId, mediaRuleOptions0);
    engine.addStyleRule(".c1", {
      style: { color: { type: "keyword", value: "blue" } },
      breakpoint: mediaId,
    });
    // Default media query should allways be the first to have the lowest source order specificity
    expect(engine.cssText).toMatchInlineSnapshot(`
      "@media all {
        .c { display: block }
        .c1 { color: red }
      }
      @media all and (min-width: 0px) {
        .c1 { color: blue }
      }"
    `);
  });

  test("rule with multiple properties", () => {
    engine.addMediaRule(mediaId, mediaRuleOptions0);
    engine.addStyleRule(".c", {
      style: {
        ...style0,
        color: { type: "keyword", value: "red" },
      },
      breakpoint: "0",
    });
    expect(engine.cssText).toMatchInlineSnapshot(`
      "@media all and (min-width: 0px) {
        .c { display: block; color: red }
      }"
    `);
  });

  test("hyphenate property", () => {
    engine.addMediaRule(mediaId, mediaRuleOptions0);
    engine.addStyleRule(".c", {
      style: {
        backgroundColor: { type: "keyword", value: "red" },
      },
      breakpoint: "0",
    });
    expect(engine.cssText).toMatchInlineSnapshot(`
      "@media all and (min-width: 0px) {
        .c { background-color: red }
      }"
    `);
  });

  test("add rule", () => {
    engine.addMediaRule(mediaId, mediaRuleOptions0);
    const rule1 = engine.addStyleRule(".c", {
      style: {
        ...style0,
        color: { type: "keyword", value: "red" },
      },
      breakpoint: "0",
    });
    expect(engine.cssText).toMatchInlineSnapshot(`
      "@media all and (min-width: 0px) {
        .c { display: block; color: red }
      }"
    `);
    expect(rule1.cssText).toMatchInlineSnapshot(
      `".c { display: block; color: red }"`
    );
    engine.addStyleRule(".c2", {
      style: {
        ...style0,
        color: { type: "keyword", value: "green" },
      },
      breakpoint: "0",
    });
    expect(engine.cssText).toMatchInlineSnapshot(`
      "@media all and (min-width: 0px) {
        .c { display: block; color: red }
        .c2 { display: block; color: green }
      }"
    `);
  });

  test("update rule", () => {
    engine.addMediaRule(mediaId, mediaRuleOptions0);
    const rule = engine.addStyleRule(".c", {
      style: {
        ...style0,
        color: { type: "keyword", value: "red" },
      },
      breakpoint: "0",
    });
    expect(engine.cssText).toMatchInlineSnapshot(`
      "@media all and (min-width: 0px) {
        .c { display: block; color: red }
      }"
    `);
    expect(rule.cssText).toMatchInlineSnapshot(
      `".c { display: block; color: red }"`
    );

    rule.styleMap.set("color", { type: "keyword", value: "green" });

    expect(rule.cssText).toMatchInlineSnapshot(
      `".c { display: block; color: green }"`
    );

    expect(engine.cssText).toMatchInlineSnapshot(`
      "@media all and (min-width: 0px) {
        .c { display: block; color: green }
      }"
    `);
  });

  test("don't override media queries", () => {
    engine.addMediaRule(mediaId, mediaRuleOptions0);
    engine.addStyleRule(".c", {
      style: style0,
      breakpoint: "0",
    });
    expect(engine.cssText).toMatchInlineSnapshot(`
      "@media all and (min-width: 0px) {
        .c { display: block }
      }"
    `);
    engine.addMediaRule(mediaId, mediaRuleOptions0);
    expect(engine.cssText).toMatchInlineSnapshot(`
      "@media all and (min-width: 0px) {
        .c { display: block }
      }"
    `);
  });

  test("plaintext rule", () => {
    engine.addPlaintextRule(".c { color: red }");
    expect(engine.cssText).toMatchInlineSnapshot(`".c { color: red }"`);
  });

  test("plaintext - no duplicates", () => {
    engine.addPlaintextRule(".c { color: red }");
    engine.addPlaintextRule(".c { color: red }");
    engine.addPlaintextRule(".c { color: green }");
    expect(engine.cssText).toMatchInlineSnapshot(`
      ".c { color: red }
      .c { color: green }"
    `);
  });

  test("font family rule", () => {
    engine.addFontFaceRule({
      fontFamily: "Roboto",
      fontStyle: "normal",
      fontWeight: 400,
      fontDisplay: "swap",
      src: "url(/src)",
    });
    expect(engine.cssText).toMatchInlineSnapshot(`
      "@font-face {
        font-family: Roboto; font-style: normal; font-weight: 400; font-display: swap; src: url(/src);
      }"
    `);
  });

  test("clear", () => {
    engine.addStyleRule(".c", {
      style: style0,
      breakpoint: "0",
    });
    engine.clear();
    expect(engine.cssText).toMatchInlineSnapshot(`""`);
  });
});
