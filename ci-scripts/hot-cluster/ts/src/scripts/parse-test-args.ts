/** Strip zero-width / bidi marks that may ride along in TEST_ARGS from PR comments. */
export const sanitizeTestArg = (value: string): string =>
  value.replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, '');

/**
 * Split a TEST_ARGS string into argv tokens, respecting single/double quotes.
 *
 * Naive whitespace splits break `/test-e2e tier1 -g "search language"` into
 * `['-g', '"search', 'language"']`, which Playwright then treats as a file filter.
 */
export const parseTestArgs = (raw: string): string[] => {
  const trimmed = sanitizeTestArg(raw).trim();
  if (!trimmed) {
    return [];
  }

  const args: string[] = [];
  const tokenRe = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|(\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = tokenRe.exec(trimmed)) !== null) {
    const token = match[1] ?? match[2] ?? match[3] ?? '';
    // Unescape simple \" and \' inside quoted tokens.
    const unescaped = token.replace(/\\(["'\\])/g, '$1');
    const sanitized = sanitizeTestArg(unescaped);
    if (sanitized) {
      args.push(sanitized);
    }
  }
  return args;
};
