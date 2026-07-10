/**
 * Utilities for building RegExp from literal strings and escaping special characters.
 */

/** Characters that have special meaning in regex and must be escaped for literal use. */
const REGEX_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g;

/**
 * Escapes special regex characters in a string so it can be used literally inside a RegExp.
 * Use when building a pattern from user input or dynamic text (e.g. labels, search terms).
 *
 * @param str - The string to escape
 * @returns The string with regex metacharacters escaped
 *
 * @example
 * escapeForRegExp('foo (bar)')  // => 'foo \\(bar\\)'
 * new RegExp(escapeForRegExp(label) + '.*')  // literal label then any chars
 */
export function escapeForRegExp(str: string): string {
  return str.replace(REGEX_SPECIAL_CHARS, '\\$&');
}

export interface RegexFromLiteralOptions {
  /** RegExp flags (e.g. 'i' for case-insensitive, 'g' for global). Defaults to 'i'. */
  flags?: string;
}

/**
 * Creates a RegExp from a literal string by escaping special characters.
 * Handles dynamic text safely (labels, names, etc.) with optional flags.
 *
 * @param literal - The exact string to match (will be escaped)
 * @param options - Optional flags or { flags: string }. Use flags: '' for case-sensitive.
 * @returns A RegExp that matches the literal string
 *
 * @example
 * regexFromLiteral('Virtualization optimized')           // case-insensitive (default)
 * regexFromLiteral('foo', { flags: '' })               // case-sensitive
 * regexFromLiteral('bar', { flags: 'gi' })             // global, case-insensitive
 */
export function regexFromLiteral(
  literal: string,
  options: string | RegexFromLiteralOptions = 'i',
): RegExp {
  const flags = typeof options === 'string' ? options : (options.flags ?? 'i');
  return new RegExp(escapeForRegExp(literal), flags);
}
