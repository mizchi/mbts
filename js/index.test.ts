import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import {
  generateDts,
  generateDtsNamespace,
  generateDtsWithPreamble,
  parseMbti,
  parseMbtiOrThrow,
  getTypes,
  getFunctions,
  getTraits,
  getTypeName,
} from "./index.js";

// Helper to read .mbti files from fixtures
const fixturesPath = join(import.meta.dirname, "../fixtures/.mooncakes");

function readMbti(relativePath: string): string {
  return readFileSync(join(fixturesPath, relativePath), "utf-8");
}

describe("generateDts with real packages", () => {
  describe("moonbitlang/x/json5", () => {
    const mbti = readMbti("moonbitlang/x/json5/pkg.generated.mbti");

    it("should parse and generate .d.ts", () => {
      const result = generateDts(mbti, "json5.mbti");
      expect(result).toMatchInlineSnapshot(`
        "// Generated from .mbti file - DO NOT EDIT

        export function parse(arg0: string): any;

        export function parse_error$to_string(arg0: ParseError): string;

        export interface ParseErrorData_NoValidToken { readonly $tag: "NoValidToken"; readonly $0: Position; }
        export interface ParseErrorData_InvalidChar { readonly $tag: "InvalidChar"; readonly $0: Position; readonly $1: Char; }
        export interface ParseErrorData_InvalidEof { readonly $tag: "InvalidEof"; }
        export interface ParseErrorData_InvalidNumber { readonly $tag: "InvalidNumber"; readonly $0: Position; readonly $1: string; }
        export interface ParseErrorData_InvalidIdentEscape { readonly $tag: "InvalidIdentEscape"; readonly $0: Position; }
        export type ParseErrorData = ParseErrorData_NoValidToken | ParseErrorData_InvalidChar | ParseErrorData_InvalidEof | ParseErrorData_InvalidNumber | ParseErrorData_InvalidIdentEscape;

        export function parse_error_data$no_valid_token($0: Position): ParseErrorData_NoValidToken;
        export function parse_error_data$invalid_char($0: Position, $1: Char): ParseErrorData_InvalidChar;
        export const ParseErrorData$InvalidEof: ParseErrorData_InvalidEof;
        export function parse_error_data$invalid_number($0: Position, $1: string): ParseErrorData_InvalidNumber;
        export function parse_error_data$invalid_ident_escape($0: Position): ParseErrorData_InvalidIdentEscape;


        export interface Position {
          readonly line: number;
          readonly column: number;
        }"
      `);
    });
  });

  describe("moonbitlang/x/time", () => {
    const mbti = readMbti("moonbitlang/x/time/pkg.generated.mbti");

    it("should parse and generate .d.ts", () => {
      const result = generateDts(mbti, "time.mbti");
      expect(result).toMatchInlineSnapshot(`
        "// Generated from .mbti file - DO NOT EDIT

        export function date_time(arg0: number, arg1: number, arg2: number, hour?: number, minute?: number, second?: number, nanosecond?: number, zone?: Zone): ZonedDateTime;

        export function fixed_zone(arg0: string, arg1: number, abbrev?: string, dst?: boolean): Zone;

        export function unix(arg0: number, nanosecond?: number, zone?: Zone): ZonedDateTime;

        export interface Duration {
          readonly __brand: "Duration";
        }

        export function duration$add_duration(arg0: Duration, arg1: Duration): Duration;

        export function duration$add_hours(arg0: Duration, arg1: number): Duration;

        export function duration$add_minutes(arg0: Duration, arg1: number): Duration;

        export function duration$add_nanoseconds(arg0: Duration, arg1: number): Duration;

        export function duration$add_seconds(arg0: Duration, arg1: number): Duration;

        export function duration$from_string(arg0: string): Duration;

        export function duration$is_neg(arg0: Duration): boolean;

        export function duration$is_zero(arg0: Duration): boolean;

        export function duration$nanoseconds(arg0: Duration): number;

        export function duration$of(hours?: number, minutes?: number, seconds?: number, nanoseconds?: number): Duration;

        export function duration$op_add(arg0: Duration, arg1: Duration): Duration;

        export function duration$seconds(arg0: Duration): number;

        export function duration$to_nanoseconds(arg0: Duration): number;

        export function duration$to_string(arg0: Duration): string;

        export function duration$with_nanoseconds(arg0: Duration, arg1: number): Duration;

        export function duration$with_seconds(arg0: Duration, arg1: number): Duration;

        export function duration$zero(): Duration;

        export interface Period {
          readonly __brand: "Period";
        }

        export function period$add_days(arg0: Period, arg1: number): Period;

        export function period$add_months(arg0: Period, arg1: number): Period;

        export function period$add_period(arg0: Period, arg1: Period): Period;

        export function period$add_weeks(arg0: Period, arg1: number): Period;

        export function period$add_years(arg0: Period, arg1: number): Period;

        export function period$days(arg0: Period): number;

        export function period$from_string(arg0: string): Period;

        export function period$is_neg(arg0: Period): boolean;

        export function period$is_zero(arg0: Period): boolean;

        export function period$months(arg0: Period): number;

        export function period$multiply(arg0: Period, arg1: number): Period;

        export function period$negated(arg0: Period): Period;

        export function period$of(years?: number, months?: number, days?: number): Period;

        export function period$op_add(arg0: Period, arg1: Period): Period;

        export function period$op_sub(arg0: Period, arg1: Period): Period;

        export function period$to_string(arg0: Period): string;

        export function period$to_total_months(arg0: Period): number;

        export function period$with_days(arg0: Period, arg1: number): Period;

        export function period$with_months(arg0: Period, arg1: number): Period;

        export function period$with_years(arg0: Period, arg1: number): Period;

        export function period$years(arg0: Period): number;

        export function period$zero(): Period;

        export interface PlainDate {
          readonly __brand: "PlainDate";
        }

        export function plain_date$add_days(arg0: PlainDate, arg1: number): PlainDate;

        export function plain_date$add_months(arg0: PlainDate, arg1: number): PlainDate;

        export function plain_date$add_period(arg0: PlainDate, arg1: Period): PlainDate;

        export function plain_date$add_weeks(arg0: PlainDate, arg1: number): PlainDate;

        export function plain_date$add_years(arg0: PlainDate, arg1: number): PlainDate;

        export function plain_date$day(arg0: PlainDate): number;

        export function plain_date$days_in_month(arg0: PlainDate): number;

        export function plain_date$days_in_week(arg0: PlainDate): number;

        export function plain_date$days_in_year(arg0: PlainDate): number;

        export function plain_date$era(arg0: PlainDate): string;

        export function plain_date$era_year(arg0: PlainDate): number;

        export function plain_date$from_string(arg0: string): PlainDate;

        export function plain_date$from_unix_day(arg0: number): PlainDate;

        export function plain_date$from_year_ord(arg0: number, arg1: number): PlainDate;

        export function plain_date$in_leap_year(arg0: PlainDate): boolean;

        export function plain_date$month(arg0: PlainDate): number;

        export function plain_date$months_in_year(arg0: PlainDate): number;

        export function plain_date$of(arg0: number, arg1: number, arg2: number): PlainDate;

        export function plain_date$ordinal(arg0: PlainDate): number;

        export function plain_date$to_string(arg0: PlainDate): string;

        export function plain_date$to_unix_day(arg0: PlainDate): number;

        export function plain_date$until(arg0: PlainDate, arg1: PlainDate): Period;

        export function plain_date$weekday(arg0: PlainDate): Weekday;

        export function plain_date$with_day(arg0: PlainDate, arg1: number): PlainDate;

        export function plain_date$with_month(arg0: PlainDate, arg1: number): PlainDate;

        export function plain_date$with_ordinal(arg0: PlainDate, arg1: number): PlainDate;

        export function plain_date$with_year(arg0: PlainDate, arg1: number): PlainDate;

        export function plain_date$year(arg0: PlainDate): number;

        export interface PlainDateTime {
          readonly __brand: "PlainDateTime";
        }

        export function plain_date_time$add_days(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function plain_date_time$add_duration(arg0: PlainDateTime, arg1: Duration): PlainDateTime;

        export function plain_date_time$add_hours(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function plain_date_time$add_minutes(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function plain_date_time$add_months(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function plain_date_time$add_nanoseconds(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function plain_date_time$add_period(arg0: PlainDateTime, arg1: Period): PlainDateTime;

        export function plain_date_time$add_seconds(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function plain_date_time$add_weeks(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function plain_date_time$add_years(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function plain_date_time$day(arg0: PlainDateTime): number;

        export function plain_date_time$days_in_month(arg0: PlainDateTime): number;

        export function plain_date_time$days_in_week(arg0: PlainDateTime): number;

        export function plain_date_time$days_in_year(arg0: PlainDateTime): number;

        export function plain_date_time$era(arg0: PlainDateTime): string;

        export function plain_date_time$era_year(arg0: PlainDateTime): number;

        export function plain_date_time$from_string(arg0: string): PlainDateTime;

        export function plain_date_time$from_unix_second(arg0: number, arg1: number, arg2: ZoneOffset): PlainDateTime;

        export function plain_date_time$hour(arg0: PlainDateTime): number;

        export function plain_date_time$in_leap_year(arg0: PlainDateTime): boolean;

        export function plain_date_time$minute(arg0: PlainDateTime): number;

        export function plain_date_time$month(arg0: PlainDateTime): number;

        export function plain_date_time$months_in_year(arg0: PlainDateTime): number;

        export function plain_date_time$nanosecond(arg0: PlainDateTime): number;

        export function plain_date_time$of(arg0: number, arg1: number, arg2: number, hour?: number, minute?: number, second?: number, nanosecond?: number): PlainDateTime;

        export function plain_date_time$ordinal(arg0: PlainDateTime): number;

        export function plain_date_time$second(arg0: PlainDateTime): number;

        export function plain_date_time$to_plain_date(arg0: PlainDateTime): PlainDate;

        export function plain_date_time$to_plain_time(arg0: PlainDateTime): PlainTime;

        export function plain_date_time$to_string(arg0: PlainDateTime): string;

        export function plain_date_time$to_unix_second(arg0: PlainDateTime): number;

        export function plain_date_time$weekday(arg0: PlainDateTime): Weekday;

        export function plain_date_time$with_day(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function plain_date_time$with_hour(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function plain_date_time$with_minute(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function plain_date_time$with_month(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function plain_date_time$with_nanosecond(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function plain_date_time$with_ordinal(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function plain_date_time$with_second(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function plain_date_time$with_year(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function plain_date_time$year(arg0: PlainDateTime): number;

        export interface PlainTime {
          readonly __brand: "PlainTime";
        }

        export function plain_time$add_duration(arg0: PlainTime, arg1: Duration): PlainTime;

        export function plain_time$add_hours(arg0: PlainTime, arg1: number): PlainTime;

        export function plain_time$add_minutes(arg0: PlainTime, arg1: number): PlainTime;

        export function plain_time$add_nanoseconds(arg0: PlainTime, arg1: number): PlainTime;

        export function plain_time$add_seconds(arg0: PlainTime, arg1: number): PlainTime;

        export function plain_time$at_date(arg0: PlainTime, arg1: PlainDate): PlainDateTime;

        export function plain_time$from_nanosecond_of_day(arg0: number): PlainTime;

        export function plain_time$from_second_of_day(arg0: number): PlainTime;

        export function plain_time$from_string(arg0: string): PlainTime;

        export function plain_time$hour(arg0: PlainTime): number;

        export function plain_time$minute(arg0: PlainTime): number;

        export function plain_time$nanosecond(arg0: PlainTime): number;

        export function plain_time$nanosecond_of_day(arg0: PlainTime): number;

        export function plain_time$of(arg0: number, arg1: number, arg2: number, arg3: number): PlainTime;

        export function plain_time$second(arg0: PlainTime): number;

        export function plain_time$second_of_day(arg0: PlainTime): number;

        export function plain_time$to_string(arg0: PlainTime): string;

        export function plain_time$until(arg0: PlainTime, arg1: PlainTime): Duration;

        export function plain_time$with_hour(arg0: PlainTime, arg1: number): PlainTime;

        export function plain_time$with_minute(arg0: PlainTime, arg1: number): PlainTime;

        export function plain_time$with_nanosecond(arg0: PlainTime, arg1: number): PlainTime;

        export function plain_time$with_second(arg0: PlainTime, arg1: number): PlainTime;

        export interface Weekday_Monday { readonly $tag: "Monday"; }
        export interface Weekday_Tuesday { readonly $tag: "Tuesday"; }
        export interface Weekday_Wednesday { readonly $tag: "Wednesday"; }
        export interface Weekday_Thursday { readonly $tag: "Thursday"; }
        export interface Weekday_Friday { readonly $tag: "Friday"; }
        export interface Weekday_Saturday { readonly $tag: "Saturday"; }
        export interface Weekday_Sunday { readonly $tag: "Sunday"; }
        export type Weekday = Weekday_Monday | Weekday_Tuesday | Weekday_Wednesday | Weekday_Thursday | Weekday_Friday | Weekday_Saturday | Weekday_Sunday;

        export const Weekday$Monday: Weekday_Monday;
        export const Weekday$Tuesday: Weekday_Tuesday;
        export const Weekday$Wednesday: Weekday_Wednesday;
        export const Weekday$Thursday: Weekday_Thursday;
        export const Weekday$Friday: Weekday_Friday;
        export const Weekday$Saturday: Weekday_Saturday;
        export const Weekday$Sunday: Weekday_Sunday;


        export interface Zone {
          readonly __brand: "Zone";
        }

        export function zone$from_tzif2(arg0: string, arg1: Array<number>): Zone;

        export function zone$is_fixed(arg0: Zone): boolean;

        export function zone$to_string(arg0: Zone): string;

        export interface ZoneOffset {
          readonly __brand: "ZoneOffset";
        }

        export function zone_offset$abbreviation(arg0: ZoneOffset): string;

        export function zone_offset$from_seconds(arg0: number, abbrev?: string, dst?: boolean): ZoneOffset;

        export function zone_offset$id(arg0: ZoneOffset): string;

        export function zone_offset$is_dst(arg0: ZoneOffset): boolean;

        export function zone_offset$of(hours?: number, minutes?: number, seconds?: number, abbrev?: string, dst?: boolean): ZoneOffset;

        export function zone_offset$seconds(arg0: ZoneOffset): number;

        export function zone_offset$to_string(arg0: ZoneOffset): string;

        export interface ZonedDateTime {
          readonly __brand: "ZonedDateTime";
        }

        export function zoned_date_time$add_days(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function zoned_date_time$add_hours(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function zoned_date_time$add_minutes(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function zoned_date_time$add_months(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function zoned_date_time$add_nanoseconds(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function zoned_date_time$add_seconds(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function zoned_date_time$add_weeks(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function zoned_date_time$add_years(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function zoned_date_time$day(arg0: ZonedDateTime): number;

        export function zoned_date_time$days_in_month(arg0: ZonedDateTime): number;

        export function zoned_date_time$days_in_week(arg0: ZonedDateTime): number;

        export function zoned_date_time$days_in_year(arg0: ZonedDateTime): number;

        export function zoned_date_time$era(arg0: ZonedDateTime): string;

        export function zoned_date_time$era_year(arg0: ZonedDateTime): number;

        export function zoned_date_time$from_plain_datetime(arg0: PlainDateTime, zone?: Zone): ZonedDateTime;

        export function zoned_date_time$from_unix_second(arg0: number, nanosecond?: number, zone?: Zone): ZonedDateTime;

        export function zoned_date_time$hour(arg0: ZonedDateTime): number;

        export function zoned_date_time$in_leap_year(arg0: ZonedDateTime): boolean;

        export function zoned_date_time$minute(arg0: ZonedDateTime): number;

        export function zoned_date_time$month(arg0: ZonedDateTime): number;

        export function zoned_date_time$months_in_year(arg0: ZonedDateTime): number;

        export function zoned_date_time$nanosecond(arg0: ZonedDateTime): number;

        export function zoned_date_time$of(arg0: number, arg1: number, arg2: number, hour?: number, minute?: number, second?: number, nanosecond?: number, zone?: Zone): ZonedDateTime;

        export function zoned_date_time$offset(arg0: ZonedDateTime): ZoneOffset;

        export function zoned_date_time$ordinal(arg0: ZonedDateTime): number;

        export function zoned_date_time$second(arg0: ZonedDateTime): number;

        export function zoned_date_time$to_plain_date(arg0: ZonedDateTime): PlainDate;

        export function zoned_date_time$to_plain_date_time(arg0: ZonedDateTime): PlainDateTime;

        export function zoned_date_time$to_plain_time(arg0: ZonedDateTime): PlainTime;

        export function zoned_date_time$to_string(arg0: ZonedDateTime): string;

        export function zoned_date_time$to_unix_second(arg0: ZonedDateTime): number;

        export function zoned_date_time$weekday(arg0: ZonedDateTime): Weekday;

        export function zoned_date_time$with_day(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function zoned_date_time$with_hour(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function zoned_date_time$with_minute(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function zoned_date_time$with_month(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function zoned_date_time$with_nanosecond(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function zoned_date_time$with_ordinal(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function zoned_date_time$with_second(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function zoned_date_time$with_year(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function zoned_date_time$year(arg0: ZonedDateTime): number;

        export function zoned_date_time$zone(arg0: ZonedDateTime): Zone;"
      `);
    });
  });

  describe("moonbitlang/x/decimal", () => {
    const mbti = readMbti("moonbitlang/x/decimal/pkg.generated.mbti");

    it("should parse and generate .d.ts", () => {
      const result = generateDts(mbti, "decimal.mbti");
      expect(result).toMatchInlineSnapshot(`
        "// Generated from .mbti file - DO NOT EDIT

        export function neg_one(): Decimal;

        export function one(): Decimal;

        export function zero(): Decimal;

        export interface Decimal {
          readonly coefficient: any /* TODO: @bigint.BigInt */;
          readonly scale: number;
        }

        export function decimal$abs(arg0: Decimal): Decimal;

        export function decimal$coefficient(arg0: Decimal): any /* TODO: @bigint.BigInt */;

        export function decimal$from_bigint(arg0: any /* TODO: @bigint.BigInt */): Decimal;

        export function decimal$from_double(arg0: number, arg1: number): Decimal | undefined;

        export function decimal$from_int(arg0: number): Decimal;

        export function decimal$from_string(arg0: string): Decimal | undefined;

        export function decimal$is_negative(arg0: Decimal): boolean;

        export function decimal$is_positive(arg0: Decimal): boolean;

        export function decimal$is_zero(arg0: Decimal): boolean;

        export function decimal$new(arg0: any /* TODO: @bigint.BigInt */, arg1: number): Decimal | undefined;

        export function decimal$round(arg0: Decimal, arg1: number): Decimal | undefined;

        export function decimal$scale(arg0: Decimal): number;

        export function decimal$scale_to(arg0: Decimal, arg1: number): Decimal | undefined;

        export function decimal$signum(arg0: Decimal): number;

        export function decimal$to_bigint(arg0: Decimal): any /* TODO: @bigint.BigInt */;

        export function decimal$to_double(arg0: Decimal): number;

        export function decimal$to_int(arg0: Decimal): number | undefined;

        export function decimal$to_string(arg0: Decimal): string;

        export function decimal$truncate(arg0: Decimal, arg1: number): Decimal | undefined;"
      `);
    });
  });

  describe("moonbitlang/x/uuid", () => {
    const mbti = readMbti("moonbitlang/x/uuid/pkg.generated.mbti");

    it("should parse and generate .d.ts", () => {
      const result = generateDts(mbti, "uuid.mbti");
      expect(result).toMatchInlineSnapshot(`
        "// Generated from .mbti file - DO NOT EDIT

        export function from_bytes(arg0: Uint8Array): UUID;

        export function from_hex(arg0: string): UUID;

        export interface UUID {
          readonly __brand: "UUID";
        }

        export function uuid$as_version(arg0: UUID, arg1: Version): UUID;

        export function uuid$hash(arg0: UUID): number;

        export function uuid$to_bytes(arg0: UUID): Uint8Array;

        export function uuid$to_string(arg0: UUID): string;

        export function uuid$variant(arg0: UUID): Variant;

        export function uuid$version(arg0: UUID): Version | undefined;

        export interface Variant_ReservedNCS { readonly $tag: "ReservedNCS"; }
        export interface Variant_RFC4122 { readonly $tag: "RFC4122"; readonly $0: Version; }
        export interface Variant_ReservedMicrosoft { readonly $tag: "ReservedMicrosoft"; }
        export interface Variant_ReservedFuture { readonly $tag: "ReservedFuture"; }
        export type Variant = Variant_ReservedNCS | Variant_RFC4122 | Variant_ReservedMicrosoft | Variant_ReservedFuture;

        export const Variant$ReservedNCS: Variant_ReservedNCS;
        export function variant$rfc4122($0: Version): Variant_RFC4122;
        export const Variant$ReservedMicrosoft: Variant_ReservedMicrosoft;
        export const Variant$ReservedFuture: Variant_ReservedFuture;


        export interface Version_V1 { readonly $tag: "V1"; }
        export interface Version_V2 { readonly $tag: "V2"; }
        export interface Version_V3 { readonly $tag: "V3"; }
        export interface Version_V4 { readonly $tag: "V4"; }
        export interface Version_V5 { readonly $tag: "V5"; }
        export interface Version_Unknown { readonly $tag: "Unknown"; readonly $0: number; }
        export type Version = Version_V1 | Version_V2 | Version_V3 | Version_V4 | Version_V5 | Version_Unknown;

        export const Version$V1: Version_V1;
        export const Version$V2: Version_V2;
        export const Version$V3: Version_V3;
        export const Version$V4: Version_V4;
        export const Version$V5: Version_V5;
        export function version$unknown($0: number): Version_Unknown;"
      `);
    });
  });

  describe("rami3l/cmark", () => {
    const mbti = readMbti("rami3l/cmark/src/cmark/pkg.generated.mbti");

    it("should parse and generate .d.ts", () => {
      const result = generateDts(mbti, "cmark.mbti");
      expect(result).toMatchInlineSnapshot(`
        "// Generated from .mbti file - DO NOT EDIT

        export function layout_of_string(meta?: any /* TODO: @cmark_base.Meta */, arg0: string): Node<string>;

        export interface Block_BlankLine { readonly $tag: "BlankLine"; readonly $0: Node<string>; }
        export interface Block_BlockQuote { readonly $tag: "BlockQuote"; readonly $0: Node<BlockQuote>; }
        export interface Block_Blocks { readonly $tag: "Blocks"; readonly $0: Node<Seq<Block>>; }
        export interface Block_CodeBlock { readonly $tag: "CodeBlock"; readonly $0: Node<CodeBlock>; }
        export interface Block_Heading { readonly $tag: "Heading"; readonly $0: Node<BlockHeading>; }
        export interface Block_HtmlBlock { readonly $tag: "HtmlBlock"; readonly $0: Node<HtmlBlock>; }
        export interface Block_LinkRefDefinition { readonly $tag: "LinkRefDefinition"; readonly $0: Node<LinkDefinition>; }
        export interface Block_List { readonly $tag: "List"; readonly $0: Node<BlockList>; }
        export interface Block_Paragraph { readonly $tag: "Paragraph"; readonly $0: Node<BlockParagraph>; }
        export interface Block_ThematicBreak { readonly $tag: "ThematicBreak"; readonly $0: Node<BlockThematicBreak>; }
        export interface Block_ExtMathBlock { readonly $tag: "ExtMathBlock"; readonly $0: Node<CodeBlock>; }
        export interface Block_ExtTable { readonly $tag: "ExtTable"; readonly $0: Node<Table>; }
        export interface Block_ExtFootnoteDefinition { readonly $tag: "ExtFootnoteDefinition"; readonly $0: Node<Footnote>; }
        export type Block = Block_BlankLine | Block_BlockQuote | Block_Blocks | Block_CodeBlock | Block_Heading | Block_HtmlBlock | Block_LinkRefDefinition | Block_List | Block_Paragraph | Block_ThematicBreak | Block_ExtMathBlock | Block_ExtTable | Block_ExtFootnoteDefinition;

        export function block$blank_line($0: Node<string>): Block_BlankLine;
        export function block$block_quote($0: Node<BlockQuote>): Block_BlockQuote;
        export function block$blocks($0: Node<Seq<Block>>): Block_Blocks;
        export function block$code_block($0: Node<CodeBlock>): Block_CodeBlock;
        export function block$heading($0: Node<BlockHeading>): Block_Heading;
        export function block$html_block($0: Node<HtmlBlock>): Block_HtmlBlock;
        export function block$link_ref_definition($0: Node<LinkDefinition>): Block_LinkRefDefinition;
        export function block$list($0: Node<BlockList>): Block_List;
        export function block$paragraph($0: Node<BlockParagraph>): Block_Paragraph;
        export function block$thematic_break($0: Node<BlockThematicBreak>): Block_ThematicBreak;
        export function block$ext_math_block($0: Node<CodeBlock>): Block_ExtMathBlock;
        export function block$ext_table($0: Node<Table>): Block_ExtTable;
        export function block$ext_footnote_definition($0: Node<Footnote>): Block_ExtFootnoteDefinition;


        export function block$defs(arg0: Block, init?: Map<string, LabelDef>): Map<string, LabelDef>;

        export function block$empty(): Block;

        export function block$meta(arg0: Block): any /* TODO: @cmark_base.Meta */;

        export function block$normalize(arg0: Block): Block;

        export interface BlockHeading {
          readonly layout: BlockHeadingLayout;
          readonly level: number;
          readonly inline: Inline;
          readonly id: BlockHeadingId | undefined;
        }

        export function block_heading$new(id?: BlockHeadingId | undefined, layout?: BlockHeadingLayout, level: number, arg0: Inline): BlockHeading;

        export interface BlockHeadingAtxLayout {
          readonly indent: number;
          readonly after_opening: string;
          readonly closing: string;
        }

        export function block_heading_atx_layout$default(): BlockHeadingAtxLayout;

        export interface BlockHeadingId_Auto { readonly $tag: "Auto"; readonly $0: string; }
        export interface BlockHeadingId_Id { readonly $tag: "Id"; readonly $0: string; }
        export type BlockHeadingId = BlockHeadingId_Auto | BlockHeadingId_Id;

        export function block_heading_id$auto($0: string): BlockHeadingId_Auto;
        export function block_heading_id$id($0: string): BlockHeadingId_Id;


        export interface BlockHeadingLayout_Atx { readonly $tag: "Atx"; readonly $0: BlockHeadingAtxLayout; }
        export interface BlockHeadingLayout_Setext { readonly $tag: "Setext"; readonly $0: BlockHeadingSetextLayout; }
        export type BlockHeadingLayout = BlockHeadingLayout_Atx | BlockHeadingLayout_Setext;

        export function block_heading_layout$atx($0: BlockHeadingAtxLayout): BlockHeadingLayout_Atx;
        export function block_heading_layout$setext($0: BlockHeadingSetextLayout): BlockHeadingLayout_Setext;


        export interface BlockHeadingSetextLayout {
          readonly leading_indent: number;
          readonly trailing_blanks: string;
          readonly underline_indent: number;
          readonly underline_count: Node<number>;
          readonly underline_blanks: string;
        }

        export type BlockLine = [Node<string>];

        export function block_line$inner(arg0: BlockLine): Node<string>;

        export function block_line$list_text_loc(arg0: Seq<BlockLine>): any /* TODO: @cmark_base.TextLoc */;

        export function block_line$to_string(arg0: BlockLine): string;

        export interface BlockList {
          readonly ty: any /* TODO: @cmark_base.ListType */;
          readonly tight: boolean;
          readonly items: Seq<Node<ListItem>>;
        }

        export function block_list$map_items(arg0: BlockList, arg1: (arg0: ListItem) => ListItem): BlockList;

        export function block_list$normalize_items(arg0: BlockList): BlockList;

        export interface BlockParagraph {
          readonly leading_indent: number;
          readonly inline: Inline;
          readonly trailing_blanks: string;
        }

        export function block_paragraph$new(leading_indent?: number, trailing_blanks?: string, arg0: Inline): BlockParagraph;

        export interface BlockQuote {
          readonly indent: number;
          readonly block: Block;
        }

        export function block_quote$map_block(arg0: BlockQuote, arg1: (arg0: Block) => Block): BlockQuote;

        export function block_quote$new(indent?: number, arg0: Block): BlockQuote;

        export function block_quote$normalize_block(arg0: BlockQuote): BlockQuote;

        export interface BlockThematicBreak {
          readonly indent: number;
          readonly layout: string;
        }

        export function block_thematic_break$new(indent?: number, layout?: string): BlockThematicBreak;

        export interface CodeBlock {
          readonly layout: CodeBlockLayout;
          readonly info_string: Node<string> | undefined;
          readonly code: Seq<Node<string>>;
        }

        export function code_block$language_of_info_string(arg0: string): [string, string] | undefined;

        export function code_block$make_fence(arg0: CodeBlock): [Char, number];

        export function code_block$new(layout?: CodeBlockLayout, info_string?: Node<string> | undefined, arg0: Seq<Node<string>>): CodeBlock;

        export interface CodeBlockFencedLayout {
          readonly indent: number;
          readonly opening_fence: Node<string>;
          readonly closing_fence: Node<string> | undefined;
        }

        export function code_block_fenced_layout$default(): CodeBlockFencedLayout;

        export interface CodeBlockLayout_Indented { readonly $tag: "Indented"; }
        export interface CodeBlockLayout_Fenced { readonly $tag: "Fenced"; readonly $0: CodeBlockFencedLayout; }
        export type CodeBlockLayout = CodeBlockLayout_Indented | CodeBlockLayout_Fenced;

        export const CodeBlockLayout$Indented: CodeBlockLayout_Indented;
        export function code_block_layout$fenced($0: CodeBlockFencedLayout): CodeBlockLayout_Fenced;


        export interface Doc {
          readonly nl: string;
          readonly block: Block;
          readonly defs: Map<string, LabelDef>;
        }

        export function doc$empty(): Doc;

        export function doc$from_string(defs?: Map<string, LabelDef>, resolver?: LabelResolverFn, nested_links?: boolean, heading_auto_ids?: boolean, layout?: boolean, locs?: boolean, file?: string, strict?: boolean, arg0: string): Doc;

        export function doc$new(nl?: string, defs?: Map<string, LabelDef>, arg0: Block): Doc;

        export type FoldFn<A, B> = [(arg0: Folder<B>, arg1: B, arg2: A) => B];

        export function fold_fn$inner<A, B>(arg0: FoldFn<A, B>): (arg0: Folder<B>, arg1: B, arg2: A) => B;

        export interface Folder<A> {
          readonly inline_ext_default: FoldFn<Inline, A>;
          readonly block_ext_default: FoldFn<Block, A>;
          readonly inline: FolderFn<Inline, A>;
          readonly block: FolderFn<Block, A>;
        }

        export function folder$block_ext_none<A>(arg0: Folder<A>, arg1: A, arg2: Block): A;

        export function folder$fold_block<A>(arg0: Folder<A>, arg1: A, arg2: Block): A;

        export function folder$fold_doc<A>(arg0: Folder<A>, arg1: A, arg2: Doc): A;

        export function folder$fold_inline<A>(arg0: Folder<A>, arg1: A, arg2: Inline): A;

        export function folder$inline_ext_none<A>(arg0: Folder<A>, arg1: A, arg2: Inline): A;

        export function folder$new<A>(inline_ext_default?: FoldFn<Inline, A>, block_ext_default?: FoldFn<Block, A>, inline?: FolderFn<Inline, A>, block?: FolderFn<Block, A>): Folder<A>;

        export function folder$none<A, B>(arg0: Folder<A>, arg1: A, arg2: B): FolderResult<A>;

        export function folder$ret<A>(arg0: A): FolderResult<A>;

        export type FolderFn<A, B> = [(arg0: Folder<B>, arg1: B, arg2: A) => FolderResult<B>];

        export function folder_fn$inner<A, B>(arg0: FolderFn<A, B>): (arg0: Folder<B>, arg1: B, arg2: A) => FolderResult<B>;

        export interface FolderResult_Default<A> { readonly $tag: "Default"; }
        export interface FolderResult_Fold<A> { readonly $tag: "Fold"; readonly $0: A; }
        export type FolderResult<A> = FolderResult_Default<A> | FolderResult_Fold<A>;

        export const FolderResult$Default: FolderResult_Default;
        export function folder_result$fold($0: A): FolderResult_Fold;


        export interface Footnote {
          readonly indent: number;
          readonly label: Label;
          readonly defined_label: Label | undefined;
          readonly block: Block;
        }

        export function footnote$map_block(arg0: Footnote, arg1: (arg0: Block) => Block): Footnote;

        export function footnote$new(indent?: number, defined_label?: Label | undefined, arg0: Label, arg1: Block): Footnote;

        export function footnote$normalize_block(arg0: Footnote): Footnote;

        export type HtmlBlock = [Seq<Node<string>>];

        export function html_block$inner(arg0: HtmlBlock): Seq<Node<string>>;

        export interface Inline_Autolink { readonly $tag: "Autolink"; readonly $0: Node<InlineAutolink>; }
        export interface Inline_Break { readonly $tag: "Break"; readonly $0: Node<InlineBreak>; }
        export interface Inline_CodeSpan { readonly $tag: "CodeSpan"; readonly $0: Node<InlineCodeSpan>; }
        export interface Inline_Emphasis { readonly $tag: "Emphasis"; readonly $0: Node<InlineEmphasis>; }
        export interface Inline_Image { readonly $tag: "Image"; readonly $0: Node<InlineLink>; }
        export interface Inline_Inlines { readonly $tag: "Inlines"; readonly $0: Node<Seq<Inline>>; }
        export interface Inline_Link { readonly $tag: "Link"; readonly $0: Node<InlineLink>; }
        export interface Inline_RawHtml { readonly $tag: "RawHtml"; readonly $0: Node<InlineRawHtml>; }
        export interface Inline_StrongEmphasis { readonly $tag: "StrongEmphasis"; readonly $0: Node<InlineEmphasis>; }
        export interface Inline_Text { readonly $tag: "Text"; readonly $0: Node<string>; }
        export interface Inline_ExtStrikethrough { readonly $tag: "ExtStrikethrough"; readonly $0: Node<InlineStrikethrough>; }
        export interface Inline_ExtMathSpan { readonly $tag: "ExtMathSpan"; readonly $0: Node<InlineMathSpan>; }
        export type Inline = Inline_Autolink | Inline_Break | Inline_CodeSpan | Inline_Emphasis | Inline_Image | Inline_Inlines | Inline_Link | Inline_RawHtml | Inline_StrongEmphasis | Inline_Text | Inline_ExtStrikethrough | Inline_ExtMathSpan;

        export function inline$autolink($0: Node<InlineAutolink>): Inline_Autolink;
        export function inline$break($0: Node<InlineBreak>): Inline_Break;
        export function inline$code_span($0: Node<InlineCodeSpan>): Inline_CodeSpan;
        export function inline$emphasis($0: Node<InlineEmphasis>): Inline_Emphasis;
        export function inline$image($0: Node<InlineLink>): Inline_Image;
        export function inline$inlines($0: Node<Seq<Inline>>): Inline_Inlines;
        export function inline$link($0: Node<InlineLink>): Inline_Link;
        export function inline$raw_html($0: Node<InlineRawHtml>): Inline_RawHtml;
        export function inline$strong_emphasis($0: Node<InlineEmphasis>): Inline_StrongEmphasis;
        export function inline$text($0: Node<string>): Inline_Text;
        export function inline$ext_strikethrough($0: Node<InlineStrikethrough>): Inline_ExtStrikethrough;
        export function inline$ext_math_span($0: Node<InlineMathSpan>): Inline_ExtMathSpan;


        export function inline$empty(): Inline;

        export function inline$id(arg0: Inline, buf?: StringBuilder): string;

        export function inline$is_empty(arg0: Inline): boolean;

        export function inline$meta(arg0: Inline): any /* TODO: @cmark_base.Meta */;

        export function inline$normalize(arg0: Inline): Inline;

        export function inline$to_plain_text(arg0: Inline, break_on_soft: boolean): Seq<Seq<string>>;

        export interface InlineAutolink {
          readonly is_email: boolean;
          readonly link: Node<string>;
        }

        export function inline_autolink$new(arg0: Node<string>): InlineAutolink;

        export interface InlineBreak {
          readonly layout_before: Node<string>;
          readonly ty: InlineBreakType;
          readonly layout_after: Node<string>;
        }

        export function inline_break$new(layout_before?: Node<string>, layout_after?: Node<string>, arg0: InlineBreakType): InlineBreak;

        export interface InlineBreakType_Hard { readonly $tag: "Hard"; }
        export interface InlineBreakType_Soft { readonly $tag: "Soft"; }
        export type InlineBreakType = InlineBreakType_Hard | InlineBreakType_Soft;

        export const InlineBreakType$Hard: InlineBreakType_Hard;
        export const InlineBreakType$Soft: InlineBreakType_Soft;


        export interface InlineCodeSpan {
          readonly backticks: number;
          readonly code_layout: Seq<Tight>;
        }

        export function inline_code_span$code(arg0: InlineCodeSpan): string;

        export function inline_code_span$from_string(meta?: any /* TODO: @cmark_base.Meta */, arg0: string): InlineCodeSpan;

        export function inline_code_span$new(backticks: number, arg0: Seq<Tight>): InlineCodeSpan;

        export interface InlineEmphasis {
          readonly delim: Char;
          readonly inline: Inline;
        }

        export function inline_emphasis$new(delim?: Char, arg0: Inline): InlineEmphasis;

        export interface InlineLink {
          readonly text: Inline;
          readonly reference: ReferenceKind;
        }

        export function inline_link$is_unsafe(arg0: string): boolean;

        export function inline_link$new(arg0: Inline, arg1: ReferenceKind): InlineLink;

        export function inline_link$reference_definition(arg0: InlineLink, arg1: Map<string, LabelDef>): LabelDef | undefined;

        export function inline_link$referenced_label(arg0: InlineLink): Label | undefined;

        export interface InlineMathSpan {
          readonly display: boolean;
          readonly tex_layout: Seq<Tight>;
        }

        export function inline_math_span$tex(arg0: InlineMathSpan): string;

        export type InlineRawHtml = [Seq<Tight>];

        export function inline_raw_html$inner(arg0: InlineRawHtml): Seq<Tight>;

        export type InlineStrikethrough = [Inline];

        export function inline_strikethrough$inner(arg0: InlineStrikethrough): Inline;

        export interface Label {
          readonly meta: any /* TODO: @cmark_base.Meta */;
          readonly key: string;
          readonly text: Seq<Tight>;
        }

        export function label$compare(arg0: Label, arg1: Label): number;

        export function label$new(meta?: any /* TODO: @cmark_base.Meta */, key: string, arg0: Seq<Tight>): Label;

        export function label$text_loc(arg0: Label): any /* TODO: @cmark_base.TextLoc */;

        export interface LabelContext_Def { readonly $tag: "Def"; readonly $0: Label | undefined; readonly $1: Label; }
        export interface LabelContext_Ref { readonly $tag: "Ref"; readonly $0: LinkKind; readonly $1: Label; readonly $2: Label | undefined; }
        export type LabelContext = LabelContext_Def | LabelContext_Ref;

        export function label_context$def($0: Label | undefined, $1: Label): LabelContext_Def;
        export function label_context$ref($0: LinkKind, $1: Label, $2: Label | undefined): LabelContext_Ref;


        export function label_context$default_resolver(arg0: LabelContext): Label | undefined;

        export interface LabelDef_LinkDef { readonly $tag: "LinkDef"; readonly $0: Node<LinkDefinition>; }
        export interface LabelDef_FootnoteDef { readonly $tag: "FootnoteDef"; readonly $0: Node<Footnote>; }
        export type LabelDef = LabelDef_LinkDef | LabelDef_FootnoteDef;

        export function label_def$link_def($0: Node<LinkDefinition>): LabelDef_LinkDef;
        export function label_def$footnote_def($0: Node<Footnote>): LabelDef_FootnoteDef;


        export type LabelResolverFn = [(arg0: LabelContext) => Label | undefined];

        export function label_resolver_fn$inner(arg0: LabelResolverFn): (arg0: LabelContext) => Label | undefined;

        export interface LinkDefinition {
          readonly layout: LinkDefinitionLayout;
          readonly label: Label | undefined;
          readonly defined_label: Label | undefined;
          readonly dest: Node<string> | undefined;
          readonly title: Seq<Tight> | undefined;
        }

        export function link_definition$new(layout?: LinkDefinitionLayout, label?: Label | undefined, defined_label?: Label | undefined, dest?: Node<string> | undefined, title?: Seq<Tight> | undefined): LinkDefinition;

        export interface LinkDefinitionLayout {
          readonly indent: number;
          readonly angled_dest: boolean;
          readonly before_dest: Seq<Node<string>>;
          readonly after_dest: Seq<Node<string>>;
          readonly title_open_delim: Char;
          readonly after_title: Seq<Node<string>>;
        }

        export function link_definition_layout$default(): LinkDefinitionLayout;

        export function link_definition_layout$for_dest(arg0: string): LinkDefinitionLayout;

        export interface LinkKind_Link { readonly $tag: "Link"; }
        export interface LinkKind_Image { readonly $tag: "Image"; }
        export type LinkKind = LinkKind_Link | LinkKind_Image;

        export const LinkKind$Link: LinkKind_Link;
        export const LinkKind$Image: LinkKind_Image;


        export interface ListItem {
          readonly before_marker: number;
          readonly marker: Node<string>;
          readonly after_marker: number;
          readonly block: Block;
          readonly ext_task_marker: Node<Char> | undefined;
        }

        export function list_item$map_block(arg0: ListItem, arg1: (arg0: Block) => Block): ListItem;

        export function list_item$new(before_marker?: number, marker?: Node<string>, after_marker?: number, ext_task_marker: Node<Char> | undefined, arg0: Block): ListItem;

        export function list_item$normalize_block(arg0: ListItem): ListItem;

        export interface ListTaskStatus_Cancelled { readonly $tag: "Cancelled"; }
        export interface ListTaskStatus_Checked { readonly $tag: "Checked"; }
        export interface ListTaskStatus_Unchecked { readonly $tag: "Unchecked"; }
        export interface ListTaskStatus_Other { readonly $tag: "Other"; readonly $0: Char; }
        export type ListTaskStatus = ListTaskStatus_Cancelled | ListTaskStatus_Checked | ListTaskStatus_Unchecked | ListTaskStatus_Other;

        export const ListTaskStatus$Cancelled: ListTaskStatus_Cancelled;
        export const ListTaskStatus$Checked: ListTaskStatus_Checked;
        export const ListTaskStatus$Unchecked: ListTaskStatus_Unchecked;
        export function list_task_status$other($0: Char): ListTaskStatus_Other;


        export function list_task_status$from_marker(arg0: Char): ListTaskStatus;

        export type MapFn<A> = [(arg0: Mapper, arg1: A) => A | undefined];

        export function map_fn$inner<A>(arg0: MapFn<A>): (arg0: Mapper, arg1: A) => A | undefined;

        export interface Mapper {
          readonly inline_ext_default: MapFn<Inline>;
          readonly block_ext_default: MapFn<Block>;
          readonly inline: MapperFn<Inline>;
          readonly block: MapperFn<Block>;
        }

        export function mapper$block_ext_none<A>(arg0: Mapper, arg1: A): A | undefined;

        export function mapper$delete<A>(): MapperResult<A>;

        export function mapper$inline_ext_none<A>(arg0: Mapper, arg1: A): A | undefined;

        export function mapper$map_block(arg0: Mapper, arg1: Block): Block | undefined;

        export function mapper$map_doc(arg0: Mapper, arg1: Doc): Doc;

        export function mapper$map_inline(arg0: Mapper, arg1: Inline): Inline | undefined;

        export function mapper$new(inline_ext_default?: MapFn<Inline>, block_ext_default?: MapFn<Block>, inline?: MapperFn<Inline>, block?: MapperFn<Block>): Mapper;

        export function mapper$none<A>(arg0: Mapper, arg1: A): MapperResult<A>;

        export function mapper$ret<A>(arg0: A): MapperResult<A>;

        export type MapperFn<A> = [(arg0: Mapper, arg1: A) => MapperResult<A>];

        export function mapper_fn$inner<A>(arg0: MapperFn<A>): (arg0: Mapper, arg1: A) => MapperResult<A>;

        export interface MapperResult_Default<A> { readonly $tag: "Default"; }
        export interface MapperResult_Map<A> { readonly $tag: "Map"; readonly $0: A | undefined; }
        export type MapperResult<A> = MapperResult_Default<A> | MapperResult_Map<A>;

        export const MapperResult$Default: MapperResult_Default;
        export function mapper_result$map($0: A | undefined): MapperResult_Map;


        export interface Node<A> {
          readonly v: A;
          readonly meta: any /* TODO: @cmark_base.Meta */;
        }

        export function node$empty(meta?: any /* TODO: @cmark_base.Meta */): Node<string>;

        export function node$map<A, B>(arg0: Node<A>, arg1: (arg0: A) => B): Node<B>;

        export function node$new<A>(arg0: A, meta?: any /* TODO: @cmark_base.Meta */): Node<A>;

        export interface ReferenceKind_Inline { readonly $tag: "Inline"; readonly $0: Node<LinkDefinition>; }
        export interface ReferenceKind_Ref { readonly $tag: "Ref"; readonly $0: ReferenceLayout; readonly $1: Label; readonly $2: Label; }
        export type ReferenceKind = ReferenceKind_Inline | ReferenceKind_Ref;

        export function reference_kind$inline($0: Node<LinkDefinition>): ReferenceKind_Inline;
        export function reference_kind$ref($0: ReferenceLayout, $1: Label, $2: Label): ReferenceKind_Ref;


        export interface ReferenceLayout_Collapsed { readonly $tag: "Collapsed"; }
        export interface ReferenceLayout_Full { readonly $tag: "Full"; }
        export interface ReferenceLayout_Shortcut { readonly $tag: "Shortcut"; }
        export type ReferenceLayout = ReferenceLayout_Collapsed | ReferenceLayout_Full | ReferenceLayout_Shortcut;

        export const ReferenceLayout$Collapsed: ReferenceLayout_Collapsed;
        export const ReferenceLayout$Full: ReferenceLayout_Full;
        export const ReferenceLayout$Shortcut: ReferenceLayout_Shortcut;


        export interface Seq<A> {
          readonly __brand: "Seq";
        }

        export function seq$empty<A>(): Seq<A>;

        export function seq$fold<A, B>(arg0: Seq<A>, init: B, arg1: (arg0: B, arg1: A) => B): B;

        export function seq$from_array<A>(arg0: Array<A>): Seq<A>;

        export function seq$from_iter<A>(arg0: Iter<A>): Seq<A>;

        export function seq$get<A>(arg0: Seq<A>, arg1: number): A | undefined;

        export function seq$is_empty<A>(arg0: Seq<A>): boolean;

        export function seq$iter<A>(arg0: Seq<A>): Iter<A>;

        export function seq$length<A>(arg0: Seq<A>): number;

        export function seq$map<A, B>(arg0: Seq<A>, arg1: (arg0: A) => B): Seq<B>;

        export function seq$op_get<A>(arg0: Seq<A>, arg1: number): A;

        export function seq$op_set<A>(arg0: Seq<A>, arg1: number, arg2: A): void;

        export function seq$rev_fold<A, B>(arg0: Seq<A>, init: B, arg1: (arg0: B, arg1: A) => B): B;

        export function seq$to_array<A>(arg0: Seq<A>): Array<A>;

        export interface Table {
          readonly indent: number;
          readonly col_count: number;
          readonly rows: Seq<[Node<TableRow>, string]>;
        }

        export function table$new(indent?: number, arg0: Seq<[Node<TableRow>, string]>): Table;

        export interface TableAlign_Left { readonly $tag: "Left"; }
        export interface TableAlign_Center { readonly $tag: "Center"; }
        export interface TableAlign_Right { readonly $tag: "Right"; }
        export type TableAlign = TableAlign_Left | TableAlign_Center | TableAlign_Right;

        export const TableAlign$Left: TableAlign_Left;
        export const TableAlign$Center: TableAlign_Center;
        export const TableAlign$Right: TableAlign_Right;


        export type TableCellLayout = [[string, string]];

        export function table_cell_layout$inner(arg0: TableCellLayout): [string, string];

        export interface TableRow_Header { readonly $tag: "Header"; readonly $0: Seq<[Inline, TableCellLayout]>; }
        export interface TableRow_Sep { readonly $tag: "Sep"; readonly $0: Seq<Node<TableSep>>; }
        export interface TableRow_Data { readonly $tag: "Data"; readonly $0: Seq<[Inline, TableCellLayout]>; }
        export type TableRow = TableRow_Header | TableRow_Sep | TableRow_Data;

        export function table_row$header($0: Seq<[Inline, TableCellLayout]>): TableRow_Header;
        export function table_row$sep($0: Seq<Node<TableSep>>): TableRow_Sep;
        export function table_row$data($0: Seq<[Inline, TableCellLayout]>): TableRow_Data;


        export type TableSep = [[TableAlign | undefined, number]];

        export function table_sep$inner(arg0: TableSep): [TableAlign | undefined, number];

        export interface Tight {
          readonly blanks: string;
          readonly node: Node<string>;
        }

        export function tight$empty(meta?: any /* TODO: @cmark_base.Meta */): Tight;

        export function tight$list_text_loc(arg0: Seq<Tight>): any /* TODO: @cmark_base.TextLoc */;

        export function tight$to_string(arg0: Tight): string;

        export type Blanks = string;

        export type BlanksNode = Node<string>;

        export type BlockBlankLine = string;

        export type BlockLineBlank = Node<string>;

        export type Count = number;

        export type InlineText = string;

        export type LabelDefs = Map<string, LabelDef>;

        export type LabelKey = string;

        export type ListItemBlock = ListItem;

        export type StringNode = Node<string>;"
      `);
    });
  });
});

describe("generateDts basic patterns", () => {
  it("should generate interface from struct", () => {
    const mbti = `
package "test"

pub struct User {
  name : String
  age : Int
}
`;
    const result = generateDts(mbti, "test.mbti");
    expect(result).toMatchInlineSnapshot(`
      "// Generated from .mbti file - DO NOT EDIT

      export interface User {
        readonly name: string;
        readonly age: number;
      }"
    `);
  });

  it("should generate discriminated union from enum", () => {
    const mbti = `
package "test"

pub enum Status {
  Pending
  Active
  Done
}
`;
    const result = generateDts(mbti, "test.mbti");
    expect(result).toMatchInlineSnapshot(`
      "// Generated from .mbti file - DO NOT EDIT

      export interface Status_Pending { readonly $tag: "Pending"; }
      export interface Status_Active { readonly $tag: "Active"; }
      export interface Status_Done { readonly $tag: "Done"; }
      export type Status = Status_Pending | Status_Active | Status_Done;

      export const Status$Pending: Status_Pending;
      export const Status$Active: Status_Active;
      export const Status$Done: Status_Done;"
    `);
  });

  it("should generate enum with payload", () => {
    const mbti = `
package "test"

pub enum Result {
  Ok(String)
  Err(String)
}
`;
    const result = generateDts(mbti, "test.mbti");
    expect(result).toMatchInlineSnapshot(`
      "// Generated from .mbti file - DO NOT EDIT

      export interface Result_Ok { readonly $tag: "Ok"; readonly $0: string; }
      export interface Result_Err { readonly $tag: "Err"; readonly $0: string; }
      export type Result = Result_Ok | Result_Err;

      export function result$ok($0: string): Result_Ok;
      export function result$err($0: string): Result_Err;"
    `);
  });

  it("should generate function signatures", () => {
    const mbti = `
package "test"

fn hello(String) -> String
fn add(Int, Int) -> Int
`;
    const result = generateDts(mbti, "test.mbti");
    expect(result).toMatchInlineSnapshot(`
      "// Generated from .mbti file - DO NOT EDIT

      export function hello(arg0: string): string;

      export function add(arg0: number, arg1: number): number;"
    `);
  });

  it("should convert snake_case to camelCase", () => {
    const mbti = `
package "test"

fn get_user_name(String) -> String
`;
    const result = generateDts(mbti, "test.mbti");
    expect(result).toMatchInlineSnapshot(`
      "// Generated from .mbti file - DO NOT EDIT

      export function get_user_name(arg0: string): string;"
    `);
  });

  it("should handle methods as Type$method", () => {
    const mbti = `
package "test"

pub struct Position {
  x : Int
  y : Int
}
fn Position::new(Int, Int) -> Self
fn Position::distance(Self) -> Int
`;
    const result = generateDts(mbti, "test.mbti");
    expect(result).toMatchInlineSnapshot(`
      "// Generated from .mbti file - DO NOT EDIT

      export interface Position {
        readonly x: number;
        readonly y: number;
      }

      export function position$new(arg0: number, arg1: number): Position;

      export function position$distance(arg0: Position): number;"
    `);
  });

  it("should handle optional parameters", () => {
    const mbti = `
package "test"

fn greet(name~ : String, greeting? : String) -> String
`;
    const result = generateDts(mbti, "test.mbti");
    expect(result).toMatchInlineSnapshot(`
      "// Generated from .mbti file - DO NOT EDIT

      export function greet(name: string, greeting?: string): string;"
    `);
  });

  it("should handle generic types", () => {
    const mbti = `
package "test"

fn[T] identity(T) -> T
fn[A, B] map(Array[A], (A) -> B) -> Array[B]
`;
    const result = generateDts(mbti, "test.mbti");
    expect(result).toMatchInlineSnapshot(`
      "// Generated from .mbti file - DO NOT EDIT

      export function identity<T>(arg0: T): T;

      export function map<A, B>(arg0: Array<A>, arg1: (arg0: A) => B): Array<B>;"
    `);
  });

  it("should skip TypeScript built-in types", () => {
    const mbti = `
package "test"

pub type Promise[T]
pub type Error
`;
    const result = generateDts(mbti, "test.mbti");
    expect(result).toMatchInlineSnapshot(`
      "// Generated from .mbti file - DO NOT EDIT

      // Using TypeScript built-in: Promise

      // Using TypeScript built-in: Error"
    `);
  });
});

describe("generateDtsNamespace", () => {
  it("should wrap output in namespace", () => {
    const mbti = `
package "moonbitlang/parser/basic"

pub struct Position {
  line : Int
  column : Int
}
`;
    const result = generateDtsNamespace(mbti, "basic.mbti");
    expect(result).toMatchInlineSnapshot(`
      "declare namespace basic {
        export interface Position {
          readonly line: number;
          readonly column: number;
        }

      }
      "
    `);
  });
});

describe("generateDtsWithPreamble", () => {
  it("should include runtime type definitions", () => {
    const mbti = `
package "test"

pub struct Config {
  value : Ref[Int]
}
`;
    const result = generateDtsWithPreamble(mbti, "test.mbti");
    expect(result).toMatchInlineSnapshot(`
      "// Generated from .mbti file - DO NOT EDIT

      // Runtime types
      export interface Ref<T> { value: T }

      export interface Config {
        readonly value: Ref<number>;
      }"
    `);
  });
});

// ============================================================
// Parser API Tests
// ============================================================

describe("parseMbti with real packages", () => {
  it("should parse moonbitlang/x/json5", () => {
    const mbti = readMbti("moonbitlang/x/json5/pkg.generated.mbti");
    const result = parseMbti(mbti, "json5.mbti");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.ast.package_name).toBe("moonbitlang/x/json5");
      expect(getTypes(result.ast).map(t => t.name.name)).toMatchInlineSnapshot(`
        [
          "ParseErrorData",
          "Position",
        ]
      `);
      expect(getFunctions(result.ast).map(f => f.name.name)).toMatchInlineSnapshot(`
        [
          "parse",
          "to_string",
        ]
      `);
    }
  });

  it("should parse moonbitlang/x/time", () => {
    const mbti = readMbti("moonbitlang/x/time/pkg.generated.mbti");
    const result = parseMbti(mbti, "time.mbti");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.ast.package_name).toBe("moonbitlang/x/time");
      expect(getTypes(result.ast).map(t => t.name.name)).toMatchInlineSnapshot(`
        [
          "Duration",
          "Period",
          "PlainDate",
          "PlainDateTime",
          "PlainTime",
          "Weekday",
          "Zone",
          "ZoneOffset",
          "ZonedDateTime",
        ]
      `);
    }
  });
});

describe("parseMbti basic patterns", () => {
  it("should parse struct and return AST", () => {
    const mbti = `
package "test"

pub struct User {
  name : String
  age : Int
}
`;
    const result = parseMbti(mbti, "test.mbti");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.ast.package_name).toBe("test");
      expect(result.ast.sigs.length).toBe(1);
      expect(result.ast.sigs[0][0].$tag).toBe("Type");
    }
  });

  it("should parse enum and return AST", () => {
    const mbti = `
package "test"

pub enum Status {
  Active
  Pending
  Done
}
`;
    const result = parseMbti(mbti, "test.mbti");
    expect(result.success).toBe(true);
    if (result.success) {
      const types = getTypes(result.ast);
      expect(types.length).toBe(1);
      expect(types[0].name.name).toBe("Status");
      expect(types[0].components.type).toBe("TypeDesc::Variant");
    }
  });

  it("should parse functions and return AST", () => {
    const mbti = `
package "test"

fn hello(String) -> String
fn add(Int, Int) -> Int
`;
    const result = parseMbti(mbti, "test.mbti");
    expect(result.success).toBe(true);
    if (result.success) {
      const funcs = getFunctions(result.ast);
      expect(funcs.length).toBe(2);
      expect(funcs[0].name.name).toBe("hello");
      expect(funcs[1].name.name).toBe("add");
    }
  });

  it("should return error for invalid input", () => {
    const mbti = `invalid mbti content`;
    const result = parseMbti(mbti, "test.mbti");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
  });
});

describe("parseMbtiOrThrow", () => {
  it("should return AST for valid input", () => {
    const mbti = `
package "test"

pub struct Point {
  x : Int
  y : Int
}
`;
    const ast = parseMbtiOrThrow(mbti, "test.mbti");
    expect(ast.package_name).toBe("test");
  });

  it("should throw for invalid input", () => {
    expect(() => {
      parseMbtiOrThrow("invalid", "test.mbti");
    }).toThrow();
  });
});

describe("AST utilities", () => {
  const mbti = `
package "test"

pub struct User {
  name : String
}

pub enum Status {
  Active
}

pub trait Show {
  to_string(Self) -> String
}

fn hello(String) -> String
`;

  it("getTypes should extract type signatures", () => {
    const ast = parseMbtiOrThrow(mbti, "test.mbti");
    const types = getTypes(ast);
    expect(types.length).toBe(2);
    expect(types.map((t) => t.name.name)).toContain("User");
    expect(types.map((t) => t.name.name)).toContain("Status");
  });

  it("getFunctions should extract function signatures", () => {
    const ast = parseMbtiOrThrow(mbti, "test.mbti");
    const funcs = getFunctions(ast);
    expect(funcs.length).toBe(1);
    expect(funcs[0].name.name).toBe("hello");
  });

  it("getTraits should extract trait signatures", () => {
    const ast = parseMbtiOrThrow(mbti, "test.mbti");
    const traits = getTraits(ast);
    expect(traits.length).toBe(1);
    expect(traits[0].name.name).toBe("Show");
  });

  it("getTypeName should extract type name from Type::Name", () => {
    const ast = parseMbtiOrThrow(mbti, "test.mbti");
    const types = getTypes(ast);
    const userType = types.find((t) => t.name.name === "User");
    expect(userType).toBeDefined();
    if (userType && userType.components.type === "TypeDesc::Record") {
      const fields = userType.components[0];
      const nameField = fields[0];
      const typeName = getTypeName(nameField.ty);
      expect(typeName).toBe("String");
    }
  });
});
