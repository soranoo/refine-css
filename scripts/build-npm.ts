import { build, emptyDir } from "@deno/dnt";
import pkg from "../deno.json" with { type: "json" }

const BASE_PATH = "./dist/npm";

await emptyDir(`${BASE_PATH}`);

await build({
  entryPoints: ["./mod.ts", "./cli.ts"],
  importMap: "deno.json",
  outDir: `${BASE_PATH}`,
  typeCheck: false,
  scriptModule: false,
  packageManager: "npm",
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  package: {
    // package.json properties
    name: "refine-css",
    description: pkg.description,
    license: pkg.license,
    author: "soranoo (Freeman)",
    bin: {
      "refine-css": "./bin/cli.mjs",
    },
    keywords: ["css", "transform", "deno"],
    repository: {
      type: "git",
      url: "git+https://github.com/soranoo/refine-css.git",
    },
    bugs: {
      url: "https://github.com/soranoo/refine-css/issues",
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE", `${BASE_PATH}/LICENSE`);
    Deno.copyFileSync("README.md", `${BASE_PATH}/README.md`);
    Deno.copyFileSync(".npmignore", `${BASE_PATH}/.npmignore`);
  },
});
