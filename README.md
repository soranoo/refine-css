# REFINE-CSS

Project starts on 02-03-2025

![Tests](https://github.com/soranoo/refine-css/actions/workflows/auto_test.yml/badge.svg) [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)&nbsp;&nbsp;&nbsp;[![Donation](https://img.shields.io/static/v1?label=Donation&message=❤️&style=social)](https://github.com/soranoo/Donation)

<!-- [![banner](./docs/imgs/banner.png)](https://github.com/soranoo/refine-css) -->

[![npm version](https://img.shields.io/npm/v/refine-css?color=red&style=flat)](https://www.npmjs.com/package/refine-css) [![npm downloads](https://img.shields.io/npm/dt/refine-css?color=blue&style=flat)](https://www.npmjs.com/package/refine-css)

<!-- [![JSR](https://jsr.io/badges/@<scope>/<package>)](https://jsr.io/@<scope>/<package>) [![JSR Score](https://jsr.io/badges/@<scope>/<package>/score)](https://jsr.io/@<scope>/<package>) -->




---

Visit the [GitHub Page](https://github.com/soranoo/refine-css/) for better reading experience and latest docs. 😎

--- 

A tool deeply inspired by [google/postcss-rename](https://github.com/google/postcss-rename) but not dependent on PostCSS. 

Refine-CSS is designed to transform CSS class names, IDs, and custom properties into smaller, obfuscated alternatives.

Give me a ⭐ if you like it.

## 📖 Table of Contents

- [🗝️ Features](#️-features)
- [🚀 Getting Started](#-getting-started)
- [📖 Config Options Reference](#-config-options-reference)
- [💻 CLI](#-cli)
- [⭐ TODO](#-todo)
- [🐛 Known Issues](#-known-issues)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)
- [⭐ Star History](#-star-history)
- [☕ Donation](#-donation)

## 🗝️ Features

- **Hash-based transformation**: Convert CSS selectors and custom properties to hash values
- **Minimal mode**: Convert to shortest possible alphabetical names (a, b, c, ...)
- **Debug mode**: Add prefixes and suffixes to help debugging transformed CSS
- **Custom seed support**: Use a specific seed to generate consistent hashes
- **Conversion tables**: Save and reuse conversion mappings between runs
- **Easy-to-use CLI**: Simple command-line interface for quick transformations

## 🚀 Getting Started

### Installation

#### Using npm

```bash
npm install -D refine-css
```

Visit the [npm](https://www.npmjs.com/package/refine-css) page for more information.

### Usage 🎉

#### Basic Usage

```bash
# Using the CLI (if installed via npm)
refine-css styles.css

# Using Deno directly
deno run cli styles.css
```

> [!NOTE]\
> This will transform your CSS file using the default hash mode and display the output in the console if no output file is specified.

#### Example: Using Minimal Mode

```bash
refine-css styles.css -m minimal
```

Input (`styles.css`):
```css
:root {
  --main-color: blue;
  --accent-color: red;
}

.button {
  background-color: var(--main-color);
}

.button.primary {
  background-color: var(--accent-color);
}
```

Prettied Output:
```css
:root {
  --a:blue; --b:red;
}.c {
  background-color:var(--a);
}.c.d {
  background-color:var(--b);
}
```

#### Example: Using Debug Mode

```bash
refine-css styles.css -m debug -d "__DEBUG__" -p "prefix-" -s "-suffix"
```

Prettied Output:
```css
:root {
   --__DEBUG__prefix-main-color-suffix:blue;
   --__DEBUG__prefix-accent-color-suffix:red;
}

.__DEBUG__prefix-\.button-suffix {
   background-color: var(--__DEBUG__prefix-main-color-suffix);
}
.__DEBUG__prefix-\.button-suffix.__DEBUG__prefix-\.primary-suffix {
   background-color: var(--__DEBUG__prefix-accent-color-suffix);
}
```

#### Example: Saving Conversion Tables

```bash
refine-css styles.css --save-tables tables.json
```

This generates a conversion table file (`tables.json`) that maps original selectors and custom properties to their transformed versions:

```json
{
  "selector": {
    "\\.button": "\\.rde48G",
    "\\.primary": "\\.K9aB2z"
  },
  "ident": {
    "main-color": "a8XPz8",
    "accent-color": "mL3o9P"
  }
}
```

#### Example: Using Saved Conversion Tables

```bash
refine-css new-styles.css --conversion-tables tables.json
```

This ensures that the same mappings are used across multiple CSS files or builds.

## 📖 Config Options Reference

| Option                       | Type                                    | Default                  | Description                                                                                                   |
| ---------------------------- | --------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `mode`                       | `"hash"` \| `"minimal"` \| `"debug"`    | `"hash"`                 | The transformation mode to use                                                                                |
| `debugSymbol`                | `string`                                | `"_"`                    | Symbol to use in debug mode                                                                                   |
| `prefix`                     | `string`                                | `""`                     | Prefix to add after debug symbol in debug mode                                                                |
| `suffix`                     | `string`                                | `""`                     | Suffix to add at the end in debug mode                                                                        |
| `seed`                       | `number`                                | `undefined`              | Seed for hash generation in hash mode                                                                         |
| `conversionTables`           | `{ selector?: {}, ident?: {} }`         | `undefined`              | Predefined conversion tables for selectors and identifiers                                                    |
| `lightningcssOptions`        | `object`                                | `{ minify: true }`       | Options for the lightningcss transform                                                                        |

### All options in one place 📦

If you're using refine-css as a library:

```ts
import { transform } from "refine-css";

const result = transform({
  css: inputCss,
  mode: "hash",          // "hash", "minimal", or "debug"
  debugSymbol: "_",      // Symbol for debug mode
  prefix: "prefix-",     // Prefix in debug mode (after symbol)
  suffix: "-suffix",     // Suffix in debug mode
  seed: 123,             // Custom seed for hash generation
  conversionTables: {    // Optional reusable mappings
    selector: { "\\.button": "preserved-class" },
    ident: { "color": "preserved-var" }
  },
  lightningcssOptions: { // Lightning CSS options
    minify: true,
    sourceMap: false
  }
});

console.log(result.css);                // The transformed CSS
console.log(result.conversionTables);   // The generated/used conversion tables
```

## 💻 CLI

The CLI provides a convenient way to transform CSS files from the command line.

```bash
refine-css [OPTIONS] <input-file>
```

### Options

```
-h, --help                   Show help message
-o, --output <file>          Output file (default: input-file with '-refined' suffix)
-m, --mode <mode>            Transformation mode: hash, minimal, or debug (default: hash)
-d, --debug-symbol <symbol>  Symbol to use for debug mode (default: _)
-p, --prefix <prefix>        Prefix to add after debug symbol in debug mode
-s, --suffix <suffix>        Suffix to add at the end in debug mode
--seed <number>              Seed for hash generation in hash mode
--minify                     Minify the output CSS (default: true)
--source-map                 Generate source map
--conversion-tables <file>   JSON file with existing conversion tables to preserve mappings
--save-tables <file>         Save the conversion tables to a JSON file
```

### Examples

```bash
# Basic usage with default options
refine-css styles.css

# Use minimal mode and specify output file
refine-css -o output.css -m minimal styles.css

# Debug mode with custom debug symbol
refine-css --mode debug --debug-symbol "_d_" styles.css

# Save and reuse conversion tables
refine-css styles.css --save-tables tables.json
refine-css other.css --conversion-tables tables.json
```

## ⭐ TODO

- [ ] Combine Selectors
- [ ] Allow selector patterns, eg. convert `.class #id` to `.newClass`
- [ ] Add CLI tests
- [ ] Publish to JSR


## 🐛 Known Issues

- Waiting for you 

<!-- ## 💖 Sponsors

Thank you to all the sponsors who support this project.

#### Organizations (0)
<table>
  <tr>
  <td align="center">
    <a href="https://github.com/xxxx">
      <img src="https://avatars.githubusercontent.com/u/147973044?v=4" width="100" alt=""/>
      <br><sub><b>username</b></sub>
    </a>
  </td>
  </tr>
</table>

#### Individuals (0)
<table>
  <tr>
  <td align="center">
    <a href="https://github.com/xxxx">
      <img src="https://avatars.githubusercontent.com/u/147973044?v=4" width="100" alt=""/>
      <br><sub><b>username</b></sub>
    </a>
  </td>
  </tr>
</table>

## 🦾 Special Thanks
<table>
  <tr>
  <td align="center">
    <a href="https://github.com/xxxx">
      <img src="https://avatars.githubusercontent.com/u/147973044?v=4" width="100" alt=""/>
      <br><sub><b>username</b></sub>
    </a>
  </td>
  </tr>
</table> -->

## 🤝 Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue. If you want to contribute code, please fork the repository and run `deno run test` before submit a pull request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=soranoo/refine-css&type=Date)](https://star-history.com/#soranoo/refine-css&Date)

## ☕ Donation

Love it? Consider a donation to support my work.

[!["Donation"](https://raw.githubusercontent.com/soranoo/Donation/main/resources/image/DonateBtn.png)](https://github.com/soranoo/Donation) <- click me~
