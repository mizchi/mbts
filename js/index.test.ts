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

        export function ParseError$toString(arg0: ParseError): string;

        export interface ParseErrorData_NoValidToken { readonly $tag: "NoValidToken"; readonly $0: Position; }
        export interface ParseErrorData_InvalidChar { readonly $tag: "InvalidChar"; readonly $0: Position; readonly $1: Char; }
        export interface ParseErrorData_InvalidEof { readonly $tag: "InvalidEof"; }
        export interface ParseErrorData_InvalidNumber { readonly $tag: "InvalidNumber"; readonly $0: Position; readonly $1: string; }
        export interface ParseErrorData_InvalidIdentEscape { readonly $tag: "InvalidIdentEscape"; readonly $0: Position; }
        export type ParseErrorData = ParseErrorData_NoValidToken | ParseErrorData_InvalidChar | ParseErrorData_InvalidEof | ParseErrorData_InvalidNumber | ParseErrorData_InvalidIdentEscape;

        export function ParseErrorData$NoValidToken($0: Position): ParseErrorData_NoValidToken;
        export function ParseErrorData$InvalidChar($0: Position, $1: Char): ParseErrorData_InvalidChar;
        export const ParseErrorData$InvalidEof: ParseErrorData_InvalidEof;
        export function ParseErrorData$InvalidNumber($0: Position, $1: string): ParseErrorData_InvalidNumber;
        export function ParseErrorData$InvalidIdentEscape($0: Position): ParseErrorData_InvalidIdentEscape;


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

        export function dateTime(arg0: number, arg1: number, arg2: number, hour?: number, minute?: number, second?: number, nanosecond?: number, zone?: Zone): ZonedDateTime;

        export function fixedZone(arg0: string, arg1: number, abbrev?: string, dst?: boolean): Zone;

        export function unix(arg0: number, nanosecond?: number, zone?: Zone): ZonedDateTime;

        export interface Duration {
          readonly __brand: "Duration";
        }

        export function Duration$addDuration(arg0: Duration, arg1: Duration): Duration;

        export function Duration$addHours(arg0: Duration, arg1: number): Duration;

        export function Duration$addMinutes(arg0: Duration, arg1: number): Duration;

        export function Duration$addNanoseconds(arg0: Duration, arg1: number): Duration;

        export function Duration$addSeconds(arg0: Duration, arg1: number): Duration;

        export function Duration$fromString(arg0: string): Duration;

        export function Duration$isNeg(arg0: Duration): boolean;

        export function Duration$isZero(arg0: Duration): boolean;

        export function Duration$nanoseconds(arg0: Duration): number;

        export function Duration$of(hours?: number, minutes?: number, seconds?: number, nanoseconds?: number): Duration;

        export function Duration$opAdd(arg0: Duration, arg1: Duration): Duration;

        export function Duration$seconds(arg0: Duration): number;

        export function Duration$toNanoseconds(arg0: Duration): number;

        export function Duration$toString(arg0: Duration): string;

        export function Duration$withNanoseconds(arg0: Duration, arg1: number): Duration;

        export function Duration$withSeconds(arg0: Duration, arg1: number): Duration;

        export function Duration$zero(): Duration;

        export interface Period {
          readonly __brand: "Period";
        }

        export function Period$addDays(arg0: Period, arg1: number): Period;

        export function Period$addMonths(arg0: Period, arg1: number): Period;

        export function Period$addPeriod(arg0: Period, arg1: Period): Period;

        export function Period$addWeeks(arg0: Period, arg1: number): Period;

        export function Period$addYears(arg0: Period, arg1: number): Period;

        export function Period$days(arg0: Period): number;

        export function Period$fromString(arg0: string): Period;

        export function Period$isNeg(arg0: Period): boolean;

        export function Period$isZero(arg0: Period): boolean;

        export function Period$months(arg0: Period): number;

        export function Period$multiply(arg0: Period, arg1: number): Period;

        export function Period$negated(arg0: Period): Period;

        export function Period$of(years?: number, months?: number, days?: number): Period;

        export function Period$opAdd(arg0: Period, arg1: Period): Period;

        export function Period$opSub(arg0: Period, arg1: Period): Period;

        export function Period$toString(arg0: Period): string;

        export function Period$toTotalMonths(arg0: Period): number;

        export function Period$withDays(arg0: Period, arg1: number): Period;

        export function Period$withMonths(arg0: Period, arg1: number): Period;

        export function Period$withYears(arg0: Period, arg1: number): Period;

        export function Period$years(arg0: Period): number;

        export function Period$zero(): Period;

        export interface PlainDate {
          readonly __brand: "PlainDate";
        }

        export function PlainDate$addDays(arg0: PlainDate, arg1: number): PlainDate;

        export function PlainDate$addMonths(arg0: PlainDate, arg1: number): PlainDate;

        export function PlainDate$addPeriod(arg0: PlainDate, arg1: Period): PlainDate;

        export function PlainDate$addWeeks(arg0: PlainDate, arg1: number): PlainDate;

        export function PlainDate$addYears(arg0: PlainDate, arg1: number): PlainDate;

        export function PlainDate$day(arg0: PlainDate): number;

        export function PlainDate$daysInMonth(arg0: PlainDate): number;

        export function PlainDate$daysInWeek(arg0: PlainDate): number;

        export function PlainDate$daysInYear(arg0: PlainDate): number;

        export function PlainDate$era(arg0: PlainDate): string;

        export function PlainDate$eraYear(arg0: PlainDate): number;

        export function PlainDate$fromString(arg0: string): PlainDate;

        export function PlainDate$fromUnixDay(arg0: number): PlainDate;

        export function PlainDate$fromYearOrd(arg0: number, arg1: number): PlainDate;

        export function PlainDate$inLeapYear(arg0: PlainDate): boolean;

        export function PlainDate$month(arg0: PlainDate): number;

        export function PlainDate$monthsInYear(arg0: PlainDate): number;

        export function PlainDate$of(arg0: number, arg1: number, arg2: number): PlainDate;

        export function PlainDate$ordinal(arg0: PlainDate): number;

        export function PlainDate$toString(arg0: PlainDate): string;

        export function PlainDate$toUnixDay(arg0: PlainDate): number;

        export function PlainDate$until(arg0: PlainDate, arg1: PlainDate): Period;

        export function PlainDate$weekday(arg0: PlainDate): Weekday;

        export function PlainDate$withDay(arg0: PlainDate, arg1: number): PlainDate;

        export function PlainDate$withMonth(arg0: PlainDate, arg1: number): PlainDate;

        export function PlainDate$withOrdinal(arg0: PlainDate, arg1: number): PlainDate;

        export function PlainDate$withYear(arg0: PlainDate, arg1: number): PlainDate;

        export function PlainDate$year(arg0: PlainDate): number;

        export interface PlainDateTime {
          readonly __brand: "PlainDateTime";
        }

        export function PlainDateTime$addDays(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function PlainDateTime$addDuration(arg0: PlainDateTime, arg1: Duration): PlainDateTime;

        export function PlainDateTime$addHours(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function PlainDateTime$addMinutes(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function PlainDateTime$addMonths(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function PlainDateTime$addNanoseconds(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function PlainDateTime$addPeriod(arg0: PlainDateTime, arg1: Period): PlainDateTime;

        export function PlainDateTime$addSeconds(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function PlainDateTime$addWeeks(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function PlainDateTime$addYears(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function PlainDateTime$day(arg0: PlainDateTime): number;

        export function PlainDateTime$daysInMonth(arg0: PlainDateTime): number;

        export function PlainDateTime$daysInWeek(arg0: PlainDateTime): number;

        export function PlainDateTime$daysInYear(arg0: PlainDateTime): number;

        export function PlainDateTime$era(arg0: PlainDateTime): string;

        export function PlainDateTime$eraYear(arg0: PlainDateTime): number;

        export function PlainDateTime$fromString(arg0: string): PlainDateTime;

        export function PlainDateTime$fromUnixSecond(arg0: number, arg1: number, arg2: ZoneOffset): PlainDateTime;

        export function PlainDateTime$hour(arg0: PlainDateTime): number;

        export function PlainDateTime$inLeapYear(arg0: PlainDateTime): boolean;

        export function PlainDateTime$minute(arg0: PlainDateTime): number;

        export function PlainDateTime$month(arg0: PlainDateTime): number;

        export function PlainDateTime$monthsInYear(arg0: PlainDateTime): number;

        export function PlainDateTime$nanosecond(arg0: PlainDateTime): number;

        export function PlainDateTime$of(arg0: number, arg1: number, arg2: number, hour?: number, minute?: number, second?: number, nanosecond?: number): PlainDateTime;

        export function PlainDateTime$ordinal(arg0: PlainDateTime): number;

        export function PlainDateTime$second(arg0: PlainDateTime): number;

        export function PlainDateTime$toPlainDate(arg0: PlainDateTime): PlainDate;

        export function PlainDateTime$toPlainTime(arg0: PlainDateTime): PlainTime;

        export function PlainDateTime$toString(arg0: PlainDateTime): string;

        export function PlainDateTime$toUnixSecond(arg0: PlainDateTime): number;

        export function PlainDateTime$weekday(arg0: PlainDateTime): Weekday;

        export function PlainDateTime$withDay(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function PlainDateTime$withHour(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function PlainDateTime$withMinute(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function PlainDateTime$withMonth(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function PlainDateTime$withNanosecond(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function PlainDateTime$withOrdinal(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function PlainDateTime$withSecond(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function PlainDateTime$withYear(arg0: PlainDateTime, arg1: number): PlainDateTime;

        export function PlainDateTime$year(arg0: PlainDateTime): number;

        export interface PlainTime {
          readonly __brand: "PlainTime";
        }

        export function PlainTime$addDuration(arg0: PlainTime, arg1: Duration): PlainTime;

        export function PlainTime$addHours(arg0: PlainTime, arg1: number): PlainTime;

        export function PlainTime$addMinutes(arg0: PlainTime, arg1: number): PlainTime;

        export function PlainTime$addNanoseconds(arg0: PlainTime, arg1: number): PlainTime;

        export function PlainTime$addSeconds(arg0: PlainTime, arg1: number): PlainTime;

        export function PlainTime$atDate(arg0: PlainTime, arg1: PlainDate): PlainDateTime;

        export function PlainTime$fromNanosecondOfDay(arg0: number): PlainTime;

        export function PlainTime$fromSecondOfDay(arg0: number): PlainTime;

        export function PlainTime$fromString(arg0: string): PlainTime;

        export function PlainTime$hour(arg0: PlainTime): number;

        export function PlainTime$minute(arg0: PlainTime): number;

        export function PlainTime$nanosecond(arg0: PlainTime): number;

        export function PlainTime$nanosecondOfDay(arg0: PlainTime): number;

        export function PlainTime$of(arg0: number, arg1: number, arg2: number, arg3: number): PlainTime;

        export function PlainTime$second(arg0: PlainTime): number;

        export function PlainTime$secondOfDay(arg0: PlainTime): number;

        export function PlainTime$toString(arg0: PlainTime): string;

        export function PlainTime$until(arg0: PlainTime, arg1: PlainTime): Duration;

        export function PlainTime$withHour(arg0: PlainTime, arg1: number): PlainTime;

        export function PlainTime$withMinute(arg0: PlainTime, arg1: number): PlainTime;

        export function PlainTime$withNanosecond(arg0: PlainTime, arg1: number): PlainTime;

        export function PlainTime$withSecond(arg0: PlainTime, arg1: number): PlainTime;

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

        export function Zone$fromTzif2(arg0: string, arg1: Array<number>): Zone;

        export function Zone$isFixed(arg0: Zone): boolean;

        export function Zone$toString(arg0: Zone): string;

        export interface ZoneOffset {
          readonly __brand: "ZoneOffset";
        }

        export function ZoneOffset$abbreviation(arg0: ZoneOffset): string;

        export function ZoneOffset$fromSeconds(arg0: number, abbrev?: string, dst?: boolean): ZoneOffset;

        export function ZoneOffset$id(arg0: ZoneOffset): string;

        export function ZoneOffset$isDst(arg0: ZoneOffset): boolean;

        export function ZoneOffset$of(hours?: number, minutes?: number, seconds?: number, abbrev?: string, dst?: boolean): ZoneOffset;

        export function ZoneOffset$seconds(arg0: ZoneOffset): number;

        export function ZoneOffset$toString(arg0: ZoneOffset): string;

        export interface ZonedDateTime {
          readonly __brand: "ZonedDateTime";
        }

        export function ZonedDateTime$addDays(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function ZonedDateTime$addHours(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function ZonedDateTime$addMinutes(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function ZonedDateTime$addMonths(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function ZonedDateTime$addNanoseconds(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function ZonedDateTime$addSeconds(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function ZonedDateTime$addWeeks(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function ZonedDateTime$addYears(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function ZonedDateTime$day(arg0: ZonedDateTime): number;

        export function ZonedDateTime$daysInMonth(arg0: ZonedDateTime): number;

        export function ZonedDateTime$daysInWeek(arg0: ZonedDateTime): number;

        export function ZonedDateTime$daysInYear(arg0: ZonedDateTime): number;

        export function ZonedDateTime$era(arg0: ZonedDateTime): string;

        export function ZonedDateTime$eraYear(arg0: ZonedDateTime): number;

        export function ZonedDateTime$fromPlainDatetime(arg0: PlainDateTime, zone?: Zone): ZonedDateTime;

        export function ZonedDateTime$fromUnixSecond(arg0: number, nanosecond?: number, zone?: Zone): ZonedDateTime;

        export function ZonedDateTime$hour(arg0: ZonedDateTime): number;

        export function ZonedDateTime$inLeapYear(arg0: ZonedDateTime): boolean;

        export function ZonedDateTime$minute(arg0: ZonedDateTime): number;

        export function ZonedDateTime$month(arg0: ZonedDateTime): number;

        export function ZonedDateTime$monthsInYear(arg0: ZonedDateTime): number;

        export function ZonedDateTime$nanosecond(arg0: ZonedDateTime): number;

        export function ZonedDateTime$of(arg0: number, arg1: number, arg2: number, hour?: number, minute?: number, second?: number, nanosecond?: number, zone?: Zone): ZonedDateTime;

        export function ZonedDateTime$offset(arg0: ZonedDateTime): ZoneOffset;

        export function ZonedDateTime$ordinal(arg0: ZonedDateTime): number;

        export function ZonedDateTime$second(arg0: ZonedDateTime): number;

        export function ZonedDateTime$toPlainDate(arg0: ZonedDateTime): PlainDate;

        export function ZonedDateTime$toPlainDateTime(arg0: ZonedDateTime): PlainDateTime;

        export function ZonedDateTime$toPlainTime(arg0: ZonedDateTime): PlainTime;

        export function ZonedDateTime$toString(arg0: ZonedDateTime): string;

        export function ZonedDateTime$toUnixSecond(arg0: ZonedDateTime): number;

        export function ZonedDateTime$weekday(arg0: ZonedDateTime): Weekday;

        export function ZonedDateTime$withDay(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function ZonedDateTime$withHour(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function ZonedDateTime$withMinute(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function ZonedDateTime$withMonth(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function ZonedDateTime$withNanosecond(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function ZonedDateTime$withOrdinal(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function ZonedDateTime$withSecond(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function ZonedDateTime$withYear(arg0: ZonedDateTime, arg1: number): ZonedDateTime;

        export function ZonedDateTime$year(arg0: ZonedDateTime): number;

        export function ZonedDateTime$zone(arg0: ZonedDateTime): Zone;"
      `);
    });
  });

  describe("moonbitlang/x/decimal", () => {
    const mbti = readMbti("moonbitlang/x/decimal/pkg.generated.mbti");

    it("should parse and generate .d.ts", () => {
      const result = generateDts(mbti, "decimal.mbti");
      expect(result).toMatchInlineSnapshot(`
        "// Generated from .mbti file - DO NOT EDIT

        export function negOne(): Decimal;

        export function one(): Decimal;

        export function zero(): Decimal;

        export interface Decimal {
          readonly coefficient: bigint.BigInt;
          readonly scale: number;
        }

        export function Decimal$abs(arg0: Decimal): Decimal;

        export function Decimal$coefficient(arg0: Decimal): bigint.BigInt;

        export function Decimal$fromBigint(arg0: bigint.BigInt): Decimal;

        export function Decimal$fromDouble(arg0: number, arg1: number): Decimal | undefined;

        export function Decimal$fromInt(arg0: number): Decimal;

        export function Decimal$fromString(arg0: string): Decimal | undefined;

        export function Decimal$isNegative(arg0: Decimal): boolean;

        export function Decimal$isPositive(arg0: Decimal): boolean;

        export function Decimal$isZero(arg0: Decimal): boolean;

        export function Decimal$new(arg0: bigint.BigInt, arg1: number): Decimal | undefined;

        export function Decimal$round(arg0: Decimal, arg1: number): Decimal | undefined;

        export function Decimal$scale(arg0: Decimal): number;

        export function Decimal$scaleTo(arg0: Decimal, arg1: number): Decimal | undefined;

        export function Decimal$signum(arg0: Decimal): number;

        export function Decimal$toBigint(arg0: Decimal): bigint.BigInt;

        export function Decimal$toDouble(arg0: Decimal): number;

        export function Decimal$toInt(arg0: Decimal): number | undefined;

        export function Decimal$toString(arg0: Decimal): string;

        export function Decimal$truncate(arg0: Decimal, arg1: number): Decimal | undefined;"
      `);
    });
  });

  describe("moonbitlang/x/uuid", () => {
    const mbti = readMbti("moonbitlang/x/uuid/pkg.generated.mbti");

    it("should parse and generate .d.ts", () => {
      const result = generateDts(mbti, "uuid.mbti");
      expect(result).toMatchInlineSnapshot(`
        "// Generated from .mbti file - DO NOT EDIT

        export function fromBytes(arg0: Uint8Array): UUID;

        export function fromHex(arg0: string): UUID;

        export interface UUID {
          readonly __brand: "UUID";
        }

        export function UUID$asVersion(arg0: UUID, arg1: Version): UUID;

        export function UUID$hash(arg0: UUID): number;

        export function UUID$toBytes(arg0: UUID): Uint8Array;

        export function UUID$toString(arg0: UUID): string;

        export function UUID$variant(arg0: UUID): Variant;

        export function UUID$version(arg0: UUID): Version | undefined;

        export interface Variant_ReservedNCS { readonly $tag: "ReservedNCS"; }
        export interface Variant_RFC4122 { readonly $tag: "RFC4122"; readonly $0: Version; }
        export interface Variant_ReservedMicrosoft { readonly $tag: "ReservedMicrosoft"; }
        export interface Variant_ReservedFuture { readonly $tag: "ReservedFuture"; }
        export type Variant = Variant_ReservedNCS | Variant_RFC4122 | Variant_ReservedMicrosoft | Variant_ReservedFuture;

        export const Variant$ReservedNCS: Variant_ReservedNCS;
        export function Variant$RFC4122($0: Version): Variant_RFC4122;
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
        export function Version$Unknown($0: number): Version_Unknown;"
      `);
    });
  });

  describe("rami3l/cmark", () => {
    const mbti = readMbti("rami3l/cmark/src/cmark/pkg.generated.mbti");

    it("should parse and generate .d.ts", () => {
      const result = generateDts(mbti, "cmark.mbti");
      expect(result).toMatchInlineSnapshot(`
        "// Generated from .mbti file - DO NOT EDIT

        export function layoutOfString(meta?: cmark_base.Meta, arg0: string): Node<string>;

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

        export function Block$BlankLine($0: Node<string>): Block_BlankLine;
        export function Block$BlockQuote($0: Node<BlockQuote>): Block_BlockQuote;
        export function Block$Blocks($0: Node<Seq<Block>>): Block_Blocks;
        export function Block$CodeBlock($0: Node<CodeBlock>): Block_CodeBlock;
        export function Block$Heading($0: Node<BlockHeading>): Block_Heading;
        export function Block$HtmlBlock($0: Node<HtmlBlock>): Block_HtmlBlock;
        export function Block$LinkRefDefinition($0: Node<LinkDefinition>): Block_LinkRefDefinition;
        export function Block$List($0: Node<BlockList>): Block_List;
        export function Block$Paragraph($0: Node<BlockParagraph>): Block_Paragraph;
        export function Block$ThematicBreak($0: Node<BlockThematicBreak>): Block_ThematicBreak;
        export function Block$ExtMathBlock($0: Node<CodeBlock>): Block_ExtMathBlock;
        export function Block$ExtTable($0: Node<Table>): Block_ExtTable;
        export function Block$ExtFootnoteDefinition($0: Node<Footnote>): Block_ExtFootnoteDefinition;


        export function Block$defs(arg0: Block, init?: Map<string, LabelDef>): Map<string, LabelDef>;

        export function Block$empty(): Block;

        export function Block$meta(arg0: Block): cmark_base.Meta;

        export function Block$normalize(arg0: Block): Block;

        export interface BlockHeading {
          readonly layout: BlockHeadingLayout;
          readonly level: number;
          readonly inline: Inline;
          readonly id: BlockHeadingId | undefined;
        }

        export function BlockHeading$new(id?: BlockHeadingId | undefined, layout?: BlockHeadingLayout, level: number, arg0: Inline): BlockHeading;

        export interface BlockHeadingAtxLayout {
          readonly indent: number;
          readonly after_opening: string;
          readonly closing: string;
        }

        export function BlockHeadingAtxLayout$default(): BlockHeadingAtxLayout;

        export interface BlockHeadingId_Auto { readonly $tag: "Auto"; readonly $0: string; }
        export interface BlockHeadingId_Id { readonly $tag: "Id"; readonly $0: string; }
        export type BlockHeadingId = BlockHeadingId_Auto | BlockHeadingId_Id;

        export function BlockHeadingId$Auto($0: string): BlockHeadingId_Auto;
        export function BlockHeadingId$Id($0: string): BlockHeadingId_Id;


        export interface BlockHeadingLayout_Atx { readonly $tag: "Atx"; readonly $0: BlockHeadingAtxLayout; }
        export interface BlockHeadingLayout_Setext { readonly $tag: "Setext"; readonly $0: BlockHeadingSetextLayout; }
        export type BlockHeadingLayout = BlockHeadingLayout_Atx | BlockHeadingLayout_Setext;

        export function BlockHeadingLayout$Atx($0: BlockHeadingAtxLayout): BlockHeadingLayout_Atx;
        export function BlockHeadingLayout$Setext($0: BlockHeadingSetextLayout): BlockHeadingLayout_Setext;


        export interface BlockHeadingSetextLayout {
          readonly leading_indent: number;
          readonly trailing_blanks: string;
          readonly underline_indent: number;
          readonly underline_count: Node<number>;
          readonly underline_blanks: string;
        }

        export type BlockLine = [Node<string>];

        export function BlockLine$inner(arg0: BlockLine): Node<string>;

        export function BlockLine$listTextLoc(arg0: Seq<BlockLine>): cmark_base.TextLoc;

        export function BlockLine$toString(arg0: BlockLine): string;

        export interface BlockList {
          readonly ty: cmark_base.ListType;
          readonly tight: boolean;
          readonly items: Seq<Node<ListItem>>;
        }

        export function BlockList$mapItems(arg0: BlockList, arg1: (arg0: ListItem) => ListItem): BlockList;

        export function BlockList$normalizeItems(arg0: BlockList): BlockList;

        export interface BlockParagraph {
          readonly leading_indent: number;
          readonly inline: Inline;
          readonly trailing_blanks: string;
        }

        export function BlockParagraph$new(leading_indent?: number, trailing_blanks?: string, arg0: Inline): BlockParagraph;

        export interface BlockQuote {
          readonly indent: number;
          readonly block: Block;
        }

        export function BlockQuote$mapBlock(arg0: BlockQuote, arg1: (arg0: Block) => Block): BlockQuote;

        export function BlockQuote$new(indent?: number, arg0: Block): BlockQuote;

        export function BlockQuote$normalizeBlock(arg0: BlockQuote): BlockQuote;

        export interface BlockThematicBreak {
          readonly indent: number;
          readonly layout: string;
        }

        export function BlockThematicBreak$new(indent?: number, layout?: string): BlockThematicBreak;

        export interface CodeBlock {
          readonly layout: CodeBlockLayout;
          readonly info_string: Node<string> | undefined;
          readonly code: Seq<Node<string>>;
        }

        export function CodeBlock$languageOfInfoString(arg0: string): [string, string] | undefined;

        export function CodeBlock$makeFence(arg0: CodeBlock): [Char, number];

        export function CodeBlock$new(layout?: CodeBlockLayout, info_string?: Node<string> | undefined, arg0: Seq<Node<string>>): CodeBlock;

        export interface CodeBlockFencedLayout {
          readonly indent: number;
          readonly opening_fence: Node<string>;
          readonly closing_fence: Node<string> | undefined;
        }

        export function CodeBlockFencedLayout$default(): CodeBlockFencedLayout;

        export interface CodeBlockLayout_Indented { readonly $tag: "Indented"; }
        export interface CodeBlockLayout_Fenced { readonly $tag: "Fenced"; readonly $0: CodeBlockFencedLayout; }
        export type CodeBlockLayout = CodeBlockLayout_Indented | CodeBlockLayout_Fenced;

        export const CodeBlockLayout$Indented: CodeBlockLayout_Indented;
        export function CodeBlockLayout$Fenced($0: CodeBlockFencedLayout): CodeBlockLayout_Fenced;


        export interface Doc {
          readonly nl: string;
          readonly block: Block;
          readonly defs: Map<string, LabelDef>;
        }

        export function Doc$empty(): Doc;

        export function Doc$fromString(defs?: Map<string, LabelDef>, resolver?: LabelResolverFn, nested_links?: boolean, heading_auto_ids?: boolean, layout?: boolean, locs?: boolean, file?: string, strict?: boolean, arg0: string): Doc;

        export function Doc$new(nl?: string, defs?: Map<string, LabelDef>, arg0: Block): Doc;

        export type FoldFn<A, B> = [(arg0: Folder<B>, arg1: B, arg2: A) => B];

        export function FoldFn$inner<A, B>(arg0: FoldFn<A, B>): (arg0: Folder<B>, arg1: B, arg2: A) => B;

        export interface Folder<A> {
          readonly inline_ext_default: FoldFn<Inline, A>;
          readonly block_ext_default: FoldFn<Block, A>;
          readonly inline: FolderFn<Inline, A>;
          readonly block: FolderFn<Block, A>;
        }

        export function Folder$blockExtNone<A>(arg0: Folder<A>, arg1: A, arg2: Block): A;

        export function Folder$foldBlock<A>(arg0: Folder<A>, arg1: A, arg2: Block): A;

        export function Folder$foldDoc<A>(arg0: Folder<A>, arg1: A, arg2: Doc): A;

        export function Folder$foldInline<A>(arg0: Folder<A>, arg1: A, arg2: Inline): A;

        export function Folder$inlineExtNone<A>(arg0: Folder<A>, arg1: A, arg2: Inline): A;

        export function Folder$new<A>(inline_ext_default?: FoldFn<Inline, A>, block_ext_default?: FoldFn<Block, A>, inline?: FolderFn<Inline, A>, block?: FolderFn<Block, A>): Folder<A>;

        export function Folder$none<A, B>(arg0: Folder<A>, arg1: A, arg2: B): FolderResult<A>;

        export function Folder$ret<A>(arg0: A): FolderResult<A>;

        export type FolderFn<A, B> = [(arg0: Folder<B>, arg1: B, arg2: A) => FolderResult<B>];

        export function FolderFn$inner<A, B>(arg0: FolderFn<A, B>): (arg0: Folder<B>, arg1: B, arg2: A) => FolderResult<B>;

        export interface FolderResult_Default<A> { readonly $tag: "Default"; }
        export interface FolderResult_Fold<A> { readonly $tag: "Fold"; readonly $0: A; }
        export type FolderResult<A> = FolderResult_Default<A> | FolderResult_Fold<A>;

        export const FolderResult$Default: FolderResult_Default;
        export function FolderResult$Fold($0: A): FolderResult_Fold;


        export interface Footnote {
          readonly indent: number;
          readonly label: Label;
          readonly defined_label: Label | undefined;
          readonly block: Block;
        }

        export function Footnote$mapBlock(arg0: Footnote, arg1: (arg0: Block) => Block): Footnote;

        export function Footnote$new(indent?: number, defined_label?: Label | undefined, arg0: Label, arg1: Block): Footnote;

        export function Footnote$normalizeBlock(arg0: Footnote): Footnote;

        export type HtmlBlock = [Seq<Node<string>>];

        export function HtmlBlock$inner(arg0: HtmlBlock): Seq<Node<string>>;

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

        export function Inline$Autolink($0: Node<InlineAutolink>): Inline_Autolink;
        export function Inline$Break($0: Node<InlineBreak>): Inline_Break;
        export function Inline$CodeSpan($0: Node<InlineCodeSpan>): Inline_CodeSpan;
        export function Inline$Emphasis($0: Node<InlineEmphasis>): Inline_Emphasis;
        export function Inline$Image($0: Node<InlineLink>): Inline_Image;
        export function Inline$Inlines($0: Node<Seq<Inline>>): Inline_Inlines;
        export function Inline$Link($0: Node<InlineLink>): Inline_Link;
        export function Inline$RawHtml($0: Node<InlineRawHtml>): Inline_RawHtml;
        export function Inline$StrongEmphasis($0: Node<InlineEmphasis>): Inline_StrongEmphasis;
        export function Inline$Text($0: Node<string>): Inline_Text;
        export function Inline$ExtStrikethrough($0: Node<InlineStrikethrough>): Inline_ExtStrikethrough;
        export function Inline$ExtMathSpan($0: Node<InlineMathSpan>): Inline_ExtMathSpan;


        export function Inline$empty(): Inline;

        export function Inline$id(arg0: Inline, buf?: StringBuilder): string;

        export function Inline$isEmpty(arg0: Inline): boolean;

        export function Inline$meta(arg0: Inline): cmark_base.Meta;

        export function Inline$normalize(arg0: Inline): Inline;

        export function Inline$toPlainText(arg0: Inline, break_on_soft: boolean): Seq<Seq<string>>;

        export interface InlineAutolink {
          readonly is_email: boolean;
          readonly link: Node<string>;
        }

        export function InlineAutolink$new(arg0: Node<string>): InlineAutolink;

        export interface InlineBreak {
          readonly layout_before: Node<string>;
          readonly ty: InlineBreakType;
          readonly layout_after: Node<string>;
        }

        export function InlineBreak$new(layout_before?: Node<string>, layout_after?: Node<string>, arg0: InlineBreakType): InlineBreak;

        export interface InlineBreakType_Hard { readonly $tag: "Hard"; }
        export interface InlineBreakType_Soft { readonly $tag: "Soft"; }
        export type InlineBreakType = InlineBreakType_Hard | InlineBreakType_Soft;

        export const InlineBreakType$Hard: InlineBreakType_Hard;
        export const InlineBreakType$Soft: InlineBreakType_Soft;


        export interface InlineCodeSpan {
          readonly backticks: number;
          readonly code_layout: Seq<Tight>;
        }

        export function InlineCodeSpan$code(arg0: InlineCodeSpan): string;

        export function InlineCodeSpan$fromString(meta?: cmark_base.Meta, arg0: string): InlineCodeSpan;

        export function InlineCodeSpan$new(backticks: number, arg0: Seq<Tight>): InlineCodeSpan;

        export interface InlineEmphasis {
          readonly delim: Char;
          readonly inline: Inline;
        }

        export function InlineEmphasis$new(delim?: Char, arg0: Inline): InlineEmphasis;

        export interface InlineLink {
          readonly text: Inline;
          readonly reference: ReferenceKind;
        }

        export function InlineLink$isUnsafe(arg0: string): boolean;

        export function InlineLink$new(arg0: Inline, arg1: ReferenceKind): InlineLink;

        export function InlineLink$referenceDefinition(arg0: InlineLink, arg1: Map<string, LabelDef>): LabelDef | undefined;

        export function InlineLink$referencedLabel(arg0: InlineLink): Label | undefined;

        export interface InlineMathSpan {
          readonly display: boolean;
          readonly tex_layout: Seq<Tight>;
        }

        export function InlineMathSpan$tex(arg0: InlineMathSpan): string;

        export type InlineRawHtml = [Seq<Tight>];

        export function InlineRawHtml$inner(arg0: InlineRawHtml): Seq<Tight>;

        export type InlineStrikethrough = [Inline];

        export function InlineStrikethrough$inner(arg0: InlineStrikethrough): Inline;

        export interface Label {
          readonly meta: cmark_base.Meta;
          readonly key: string;
          readonly text: Seq<Tight>;
        }

        export function Label$compare(arg0: Label, arg1: Label): number;

        export function Label$new(meta?: cmark_base.Meta, key: string, arg0: Seq<Tight>): Label;

        export function Label$textLoc(arg0: Label): cmark_base.TextLoc;

        export interface LabelContext_Def { readonly $tag: "Def"; readonly $0: Label | undefined; readonly $1: Label; }
        export interface LabelContext_Ref { readonly $tag: "Ref"; readonly $0: LinkKind; readonly $1: Label; readonly $2: Label | undefined; }
        export type LabelContext = LabelContext_Def | LabelContext_Ref;

        export function LabelContext$Def($0: Label | undefined, $1: Label): LabelContext_Def;
        export function LabelContext$Ref($0: LinkKind, $1: Label, $2: Label | undefined): LabelContext_Ref;


        export function LabelContext$defaultResolver(arg0: LabelContext): Label | undefined;

        export interface LabelDef_LinkDef { readonly $tag: "LinkDef"; readonly $0: Node<LinkDefinition>; }
        export interface LabelDef_FootnoteDef { readonly $tag: "FootnoteDef"; readonly $0: Node<Footnote>; }
        export type LabelDef = LabelDef_LinkDef | LabelDef_FootnoteDef;

        export function LabelDef$LinkDef($0: Node<LinkDefinition>): LabelDef_LinkDef;
        export function LabelDef$FootnoteDef($0: Node<Footnote>): LabelDef_FootnoteDef;


        export type LabelResolverFn = [(arg0: LabelContext) => Label | undefined];

        export function LabelResolverFn$inner(arg0: LabelResolverFn): (arg0: LabelContext) => Label | undefined;

        export interface LinkDefinition {
          readonly layout: LinkDefinitionLayout;
          readonly label: Label | undefined;
          readonly defined_label: Label | undefined;
          readonly dest: Node<string> | undefined;
          readonly title: Seq<Tight> | undefined;
        }

        export function LinkDefinition$new(layout?: LinkDefinitionLayout, label?: Label | undefined, defined_label?: Label | undefined, dest?: Node<string> | undefined, title?: Seq<Tight> | undefined): LinkDefinition;

        export interface LinkDefinitionLayout {
          readonly indent: number;
          readonly angled_dest: boolean;
          readonly before_dest: Seq<Node<string>>;
          readonly after_dest: Seq<Node<string>>;
          readonly title_open_delim: Char;
          readonly after_title: Seq<Node<string>>;
        }

        export function LinkDefinitionLayout$default(): LinkDefinitionLayout;

        export function LinkDefinitionLayout$forDest(arg0: string): LinkDefinitionLayout;

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

        export function ListItem$mapBlock(arg0: ListItem, arg1: (arg0: Block) => Block): ListItem;

        export function ListItem$new(before_marker?: number, marker?: Node<string>, after_marker?: number, ext_task_marker: Node<Char> | undefined, arg0: Block): ListItem;

        export function ListItem$normalizeBlock(arg0: ListItem): ListItem;

        export interface ListTaskStatus_Cancelled { readonly $tag: "Cancelled"; }
        export interface ListTaskStatus_Checked { readonly $tag: "Checked"; }
        export interface ListTaskStatus_Unchecked { readonly $tag: "Unchecked"; }
        export interface ListTaskStatus_Other { readonly $tag: "Other"; readonly $0: Char; }
        export type ListTaskStatus = ListTaskStatus_Cancelled | ListTaskStatus_Checked | ListTaskStatus_Unchecked | ListTaskStatus_Other;

        export const ListTaskStatus$Cancelled: ListTaskStatus_Cancelled;
        export const ListTaskStatus$Checked: ListTaskStatus_Checked;
        export const ListTaskStatus$Unchecked: ListTaskStatus_Unchecked;
        export function ListTaskStatus$Other($0: Char): ListTaskStatus_Other;


        export function ListTaskStatus$fromMarker(arg0: Char): ListTaskStatus;

        export type MapFn<A> = [(arg0: Mapper, arg1: A) => A | undefined];

        export function MapFn$inner<A>(arg0: MapFn<A>): (arg0: Mapper, arg1: A) => A | undefined;

        export interface Mapper {
          readonly inline_ext_default: MapFn<Inline>;
          readonly block_ext_default: MapFn<Block>;
          readonly inline: MapperFn<Inline>;
          readonly block: MapperFn<Block>;
        }

        export function Mapper$blockExtNone<A>(arg0: Mapper, arg1: A): A | undefined;

        export function Mapper$delete<A>(): MapperResult<A>;

        export function Mapper$inlineExtNone<A>(arg0: Mapper, arg1: A): A | undefined;

        export function Mapper$mapBlock(arg0: Mapper, arg1: Block): Block | undefined;

        export function Mapper$mapDoc(arg0: Mapper, arg1: Doc): Doc;

        export function Mapper$mapInline(arg0: Mapper, arg1: Inline): Inline | undefined;

        export function Mapper$new(inline_ext_default?: MapFn<Inline>, block_ext_default?: MapFn<Block>, inline?: MapperFn<Inline>, block?: MapperFn<Block>): Mapper;

        export function Mapper$none<A>(arg0: Mapper, arg1: A): MapperResult<A>;

        export function Mapper$ret<A>(arg0: A): MapperResult<A>;

        export type MapperFn<A> = [(arg0: Mapper, arg1: A) => MapperResult<A>];

        export function MapperFn$inner<A>(arg0: MapperFn<A>): (arg0: Mapper, arg1: A) => MapperResult<A>;

        export interface MapperResult_Default<A> { readonly $tag: "Default"; }
        export interface MapperResult_Map<A> { readonly $tag: "Map"; readonly $0: A | undefined; }
        export type MapperResult<A> = MapperResult_Default<A> | MapperResult_Map<A>;

        export const MapperResult$Default: MapperResult_Default;
        export function MapperResult$Map($0: A | undefined): MapperResult_Map;


        export interface Node<A> {
          readonly v: A;
          readonly meta: cmark_base.Meta;
        }

        export function Node$empty(meta?: cmark_base.Meta): Node<string>;

        export function Node$map<A, B>(arg0: Node<A>, arg1: (arg0: A) => B): Node<B>;

        export function Node$new<A>(arg0: A, meta?: cmark_base.Meta): Node<A>;

        export interface ReferenceKind_Inline { readonly $tag: "Inline"; readonly $0: Node<LinkDefinition>; }
        export interface ReferenceKind_Ref { readonly $tag: "Ref"; readonly $0: ReferenceLayout; readonly $1: Label; readonly $2: Label; }
        export type ReferenceKind = ReferenceKind_Inline | ReferenceKind_Ref;

        export function ReferenceKind$Inline($0: Node<LinkDefinition>): ReferenceKind_Inline;
        export function ReferenceKind$Ref($0: ReferenceLayout, $1: Label, $2: Label): ReferenceKind_Ref;


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

        export function Seq$empty<A>(): Seq<A>;

        export function Seq$fold<A, B>(arg0: Seq<A>, init: B, arg1: (arg0: B, arg1: A) => B): B;

        export function Seq$fromArray<A>(arg0: Array<A>): Seq<A>;

        export function Seq$fromIter<A>(arg0: Iter<A>): Seq<A>;

        export function Seq$get<A>(arg0: Seq<A>, arg1: number): A | undefined;

        export function Seq$isEmpty<A>(arg0: Seq<A>): boolean;

        export function Seq$iter<A>(arg0: Seq<A>): Iter<A>;

        export function Seq$length<A>(arg0: Seq<A>): number;

        export function Seq$map<A, B>(arg0: Seq<A>, arg1: (arg0: A) => B): Seq<B>;

        export function Seq$opGet<A>(arg0: Seq<A>, arg1: number): A;

        export function Seq$opSet<A>(arg0: Seq<A>, arg1: number, arg2: A): void;

        export function Seq$revFold<A, B>(arg0: Seq<A>, init: B, arg1: (arg0: B, arg1: A) => B): B;

        export function Seq$toArray<A>(arg0: Seq<A>): Array<A>;

        export interface Table {
          readonly indent: number;
          readonly col_count: number;
          readonly rows: Seq<[Node<TableRow>, string]>;
        }

        export function Table$new(indent?: number, arg0: Seq<[Node<TableRow>, string]>): Table;

        export interface TableAlign_Left { readonly $tag: "Left"; }
        export interface TableAlign_Center { readonly $tag: "Center"; }
        export interface TableAlign_Right { readonly $tag: "Right"; }
        export type TableAlign = TableAlign_Left | TableAlign_Center | TableAlign_Right;

        export const TableAlign$Left: TableAlign_Left;
        export const TableAlign$Center: TableAlign_Center;
        export const TableAlign$Right: TableAlign_Right;


        export type TableCellLayout = [[string, string]];

        export function TableCellLayout$inner(arg0: TableCellLayout): [string, string];

        export interface TableRow_Header { readonly $tag: "Header"; readonly $0: Seq<[Inline, TableCellLayout]>; }
        export interface TableRow_Sep { readonly $tag: "Sep"; readonly $0: Seq<Node<TableSep>>; }
        export interface TableRow_Data { readonly $tag: "Data"; readonly $0: Seq<[Inline, TableCellLayout]>; }
        export type TableRow = TableRow_Header | TableRow_Sep | TableRow_Data;

        export function TableRow$Header($0: Seq<[Inline, TableCellLayout]>): TableRow_Header;
        export function TableRow$Sep($0: Seq<Node<TableSep>>): TableRow_Sep;
        export function TableRow$Data($0: Seq<[Inline, TableCellLayout]>): TableRow_Data;


        export type TableSep = [[TableAlign | undefined, number]];

        export function TableSep$inner(arg0: TableSep): [TableAlign | undefined, number];

        export interface Tight {
          readonly blanks: string;
          readonly node: Node<string>;
        }

        export function Tight$empty(meta?: cmark_base.Meta): Tight;

        export function Tight$listTextLoc(arg0: Seq<Tight>): cmark_base.TextLoc;

        export function Tight$toString(arg0: Tight): string;

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

      export function Result$Ok($0: string): Result_Ok;
      export function Result$Err($0: string): Result_Err;"
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

      export function getUserName(arg0: string): string;"
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

      export function Position$new(arg0: number, arg1: number): Position;

      export function Position$distance(arg0: Position): number;"
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
