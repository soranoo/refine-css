import { assertEquals, assertNotEquals } from "jsr:@std/assert";
import { transform } from "@/transformer.ts";

Deno.test("transform - hash mode (default)", () => {
  const input = `
    :root { 
      --custom-prop: value; 
      --another-prop: value;
    }
    .test { color: var(--custom-prop); } 
    .another-test { background: var(--another-prop); }
  `;
  const result = transform({ css: input, lightningcssOptions: { minify: false } });

  // Basic transformation checks
  assertNotEquals(result.css, input);
  assertEquals(typeof result.css, "string");

  // Conversion tables check
  INTERNAL_assertConversionTable(result.conversionTables.selector, 2);
  INTERNAL_assertConversionTable(result.conversionTables.ident, 2);

  // Consistent hashing check
  const secondResult = transform({ css: input, lightningcssOptions: { minify: false } });
  assertEquals(result.css, secondResult.css);

  // TODO: Missing check for the actual hash values in the output
});

Deno.test("transform - minimal mode", () => {
  const input = `
    :root { 
      --custom-prop: value; 
      --another-prop: value;
    }
    .test { color: var(--custom-prop); } 
    .another-test { background: var(--another-prop); }
  `;
  const expectedOutput = `
    :root { --a: value; --b: value; }
    .c { color: var(--a); } 
    .d { background: var(--b); }
  `;
  const result = transform({ css: input, mode: "minimal", lightningcssOptions: { minify: false } });

  // Check if using alphabetical naming
  INTERNAL_assertCss(result.css, expectedOutput);

  INTERNAL_assertConversionTable(result.conversionTables.selector, 2);
  INTERNAL_assertConversionTable(result.conversionTables.ident, 2);

});

Deno.test("transform - debug mode", () => {
  const debugSymbol = "__DEBUG__";
  const prefix = "prefix-";
  const suffix = "-suffix";

  const input = `
    :root { --custom-prop: value; }
    .test { color: var(--custom-prop); }
  `;
  const expectedOutput = `
    :root { --${debugSymbol}${prefix}custom-prop${suffix}: value; }
    .${debugSymbol}${prefix}\\.test${suffix} { color: var(--${debugSymbol}${prefix}custom-prop${suffix}); }
  `;

  const result = transform({
    css: input,
    mode: "debug",
    debugSymbol,
    prefix,
    suffix,
    lightningcssOptions: { minify: false }
  });

  // Check if debug format is correct
  INTERNAL_assertCss(result.css, expectedOutput);

  // Check if new conversion tables are created
  INTERNAL_assertConversionTable(
    result.conversionTables.selector,
    1,
  );
  INTERNAL_assertConversionTable(
    result.conversionTables.ident,
    1,
  );
});

Deno.test("transform - custom seed in hash mode", () => {
  const input = ".test { color: red; }";
  const seed1Result = transform({ css: input, seed: 1, lightningcssOptions: { minify: false } });
  const seed1Result2 = transform({ css: input, seed: 1, lightningcssOptions: { minify: false } });
  const seed2Result = transform({ css: input, seed: 2, lightningcssOptions: { minify: false } });

  // Check if the same seed produces the same output
  assertEquals(seed1Result.css, seed1Result2.css);

  // Different seeds should produce different outputs
  assertNotEquals(seed1Result.css, seed2Result.css);
});

Deno.test("transform - preserves conversion tables", () => {
  const existingTables = {
    selector: { 
      "\\.existing": "\\.preserved-class",
      "\\.existing-2": "\\.preserved-class-2 \\#preserved-id",
    },
    ident: { "existing-var": "preserved-var" }
  };
  const input = `
    :root { --existing-var: value; --other-var: value; }
    .test { color: var(--other-var); } 
    .existing { color: var(--existing-var); }
    .existing-2 { color: red; }
  `;
  const expectedOutput = `
    :root { --preserved-var: value; --a: value; }
    .b { color: var(--a); } 
    .preserved-class { color: var(--preserved-var); }
    .preserved-class-2 #preserved-id { color: red; }
  `;

  const result = transform({
    css: input,
    mode: "minimal",
    conversionTables: existingTables,
    lightningcssOptions: { minify: false },
  });

  // Check if existing mappings are preserved
  assertEquals(result.conversionTables.selector[
    Object.keys(existingTables.selector)[0]
  ], Object.values(existingTables.selector)[0]);
  assertEquals(result.conversionTables.ident[
    Object.keys(existingTables.ident)[0]
  ], Object.values(existingTables.ident)[0]);
  INTERNAL_assertCss(result.css, expectedOutput);

  // Check if new mappings are added
  INTERNAL_assertConversionTable(
    result.conversionTables.selector,
    3,
  );
  INTERNAL_assertConversionTable(
    result.conversionTables.ident,
    2,
  );
});

Deno.test("transform - handles custom properties", () => {
  const input = ".test { --custom-prop: value; }";
  const result = transform({ css: input, lightningcssOptions: { minify: false } });

  // Check if custom properties are transformed
  assertNotEquals(result.css.match(/--[a-f0-9]+/)?.[0], "--custom-prop");
});

Deno.test("transform - handles complex selectors", () => {
  const input = ".test:not(.other):where(.something) { color: red; }";
  const expectedOutput = `
    .a:not(.b):where(.c) { color: red; }
  `;

  const result = transform({ css: input, mode: "minimal", lightningcssOptions: { minify: false } });

  // Check if the output is different but valid
  INTERNAL_assertCss(result.css, expectedOutput);
  INTERNAL_assertConversionTable(result.conversionTables.selector, 3);
  INTERNAL_assertConversionTable(result.conversionTables.ident, 0);
});

Deno.test("transform - handles basic selectors", () => {
  const input = `
    div { color: red; }
    #myId { color: #00f; }
    .myClass { color: green; }
    * { box-sizing: border-box; }
  `;
  const expectedOutput = `
    div { color: red; }
    #a { color: #00f; }
    .b { color: green; }
    * { box-sizing: border-box; }
  `;

  const result = transform({ css: input, mode: "minimal", lightningcssOptions: { minify: false } });

  INTERNAL_assertCss(result.css, expectedOutput);
  
  // Should have 2 selectors converted (#myId, .myClass) 
  // but not the element selector or universal selector
  INTERNAL_assertConversionTable(result.conversionTables.selector, 2);
  INTERNAL_assertConversionTable(result.conversionTables.ident, 0);
});

Deno.test("transform - handles pseudo-classes", () => {
  const input = `
    :nth-child(2n) { background: #00f; }
    :nth-last-child(odd) { margin-bottom: 10px; }
    .item:not(.active) { opacity: 0.5; }
    .menu:where(.dropdown, .popup) { position: relative; }
    .section:is(.important, .highlight) { border: 1px solid red; }
  `;
  const expectedOutput = `
    :nth-child(2n) { background: #00f; }
    :nth-last-child(odd) { margin-bottom: 10px; }
    .a:not(.b) { opacity: .5; }
    .c:where(.d, .e) { position: relative; }
    .f:is(.g, .h) { border: 1px solid red; }
  `;

  const result = transform({ css: input, mode: "minimal", lightningcssOptions: { minify: false } });

  INTERNAL_assertCss(result.css, expectedOutput);
  
  // Function-like pseudo-classes should not be converted, but class selectors should
  INTERNAL_assertConversionTable(result.conversionTables.selector, 8);
  INTERNAL_assertConversionTable(result.conversionTables.ident, 0);
});

Deno.test("transform - handles host pseudo-class", () => {
  const input = `
    :host { display: block; }
    :host(.classname) { font-weight: bold; }
  `;
  const expectedOutput = `
    :host { display: block; }
    :host(.a) { font-weight: bold; }
  `;

  const result = transform({ css: input, mode: "minimal", lightningcssOptions: { minify: false } });

  INTERNAL_assertCss(result.css, expectedOutput);
  
  // Host selectors should be preserved
  INTERNAL_assertConversionTable(result.conversionTables.selector, 1);
  INTERNAL_assertConversionTable(result.conversionTables.ident, 0);
});

Deno.test("transform - handles attribute selectors", () => {
  const input = `
    [data-attr] { display: block; }
    [data-role="button"] { cursor: pointer; }
  `;
  const expectedOutput = `
    [data-attr] { display: block; }
    [data-role="button"] { cursor: pointer; }
  `;

  const result = transform({ css: input, mode: "minimal", lightningcssOptions: { minify: false } });

  INTERNAL_assertCss(result.css, expectedOutput);
  
  // Attribute selectors should be preserved
  INTERNAL_assertConversionTable(result.conversionTables.selector, 0);
  INTERNAL_assertConversionTable(result.conversionTables.ident, 0);
});

Deno.test("transform - handles combinators", () => {
  const input = `
    .parent > .child { margin: 10px; }
    .sibling ~ .next-sibling { padding: 5px; }
  `;
  const expectedOutput = `
    .a > .b { margin: 10px; }
    .c ~ .d { padding: 5px; }
  `;

  const result = transform({ css: input, mode: "minimal", lightningcssOptions: { minify: false } });

  INTERNAL_assertCss(result.css, expectedOutput);
  
  // Each class selector should be converted
  INTERNAL_assertConversionTable(result.conversionTables.selector, 4);
  INTERNAL_assertConversionTable(result.conversionTables.ident, 0);
});

Deno.test("transform - handles multiple complex selectors", () => {
  const input = `
    .complex:not(.simple):where(.advanced) { 
      border: 2px solid black; 
    }
  `;
  const expectedOutput = `
    .a:not(.b):where(.c) { 
      border: 2px solid #000; 
    }
  `;

  const result = transform({ css: input, mode: "minimal", lightningcssOptions: { minify: false } });

  INTERNAL_assertCss(result.css, expectedOutput);
  
  // Should convert all three class selectors
  INTERNAL_assertConversionTable(result.conversionTables.selector, 3);
  INTERNAL_assertConversionTable(result.conversionTables.ident, 0);
});

Deno.test("transform - handles custom properties in :root", () => {
  const input = `
    :root {
      --main-color: purple;
      --accent-color: orange;
    }
  `;
  const expectedOutput = `
    :root {
      --a: purple;
      --b: orange;
    }
  `;

  const result = transform({ css: input, mode: "minimal", lightningcssOptions: { minify: false } });

  INTERNAL_assertCss(result.css, expectedOutput);
  
  // Should convert both custom properties
  INTERNAL_assertConversionTable(result.conversionTables.selector, 0);
  INTERNAL_assertConversionTable(result.conversionTables.ident, 2);
});

/**
 * Removes all spaces from a string.
 * 
 * @param str - The string to remove spaces from.
 * @returns The string without spaces.
 * 
 * @example
 * ```ts
 * const str = "Hello World!";
 * const noSpaces = INTERNAL_removeAllSpaces(str); // "HelloWorld!"
 * ```
 */
const INTERNAL_removeAllSpaces = (str: string) => str.replace(/\s+/g, "");

/**
 * Asserts that the given CSS string matches 
 * the expected CSS string after removing all spaces.
 * 
 * @param css - The CSS string to compare.
 * @param expected - The expected CSS string.
 * 
 * @example
 * ```ts
 * const css = ".test { color: red; }";
 * const expected = ".test{color:red;}";
 * INTERNAL_assertCss(css, expected); // Passes
 * ```
 */
const INTERNAL_assertCss = (css: string, expected: string) => {
  const normalizedCss = INTERNAL_removeAllSpaces(css);
  const normalizedExpected = INTERNAL_removeAllSpaces(expected);
  assertEquals(normalizedCss, normalizedExpected);
}

/**
 * Asserts that the conversion table has the expected number of entries.
 * 
 * @param conversionTable - The conversion table to check.
 * @param expectedNumberOfEntries - The expected number of entries in the conversion table.
 * 
 * @example
 * ```ts
 * const conversionTable = { ".test": ".a", "#id": "#b" };
 * INTERNAL_assertConversionTable(conversionTable, 2); // Passes
 * ```
 */
const INTERNAL_assertConversionTable = (
  conversionTable: Record<string, string>,
  expectedNumberOfEntries: number,
) => {
  assertEquals(Object.keys(conversionTable).length, expectedNumberOfEntries);
}
