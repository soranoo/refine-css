import type { CustomAtRules, TransformOptions } from "lightningcss-wasm";

export type ConversionTable = Record<string, string>;

export interface ConversionTables {
  /**
   * Mapping for selector conversion.
   *
   * ## **Note**
   * Make sure the keys are **escaped** properly.
   */
  selector: ConversionTable;
  /**
   * Mapping for identifier conversion.
   *
   * ## **Note**
   * Make sure the keys are **escaped** properly
   * and without the '--' prefix.
   */
  ident: ConversionTable;
}

export interface TransformProps {
  css: string;
  mode?: "hash" | "minimal" | "debug";
  debugSymbol?: string;
  prefix?: string;
  suffix?: string;
  seed?: number;
  /**
   * Predefined conversion tables for selectors and identifiers.
   * Use if you want to preserve previous mappings.
   */
  conversionTables?: Partial<ConversionTables>;
  lightningcssOptions?: Omit<
    TransformOptions<CustomAtRules>,
    | "filename"
    | "code"
    | "visitor"
  >;
}

export interface TransformResult {
  css: string;
  conversionTables: ConversionTables;
}

export type Transform = (params: TransformProps) => TransformResult;
