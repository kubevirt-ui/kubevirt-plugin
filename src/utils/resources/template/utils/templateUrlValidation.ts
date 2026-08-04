const canParseUrl = (url: string): boolean => {
  if (URL?.canParse) {
    return URL.canParse(url);
  }
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidTemplateIconUrl = (url: string): boolean => {
  if (!url) {
    return false;
  }

  // Allow relative paths starting with /
  if (/^\/[^/]/.test(url)) {
    return true;
  }

  // For absolute URLs, validate using canParseUrl helper and check protocol
  if (canParseUrl(url)) {
    try {
      const parsedUrl = new URL(url);
      // Only allow http, https protocols (block javascript:, data:, vbscript:, etc.)
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }

  return false;
};
