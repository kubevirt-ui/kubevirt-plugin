export const SELECTOR_OPERATOR_KEY_REGEX = /^[0-9A-Za-z/\-_.]+$/;
export const SELECTOR_OPERATOR_NEGATED_KEY_REGEX = /^!\s*[0-9A-Za-z/\-_.]+$/;
export const SELECTOR_OPERATOR_EQUALS_REGEX = /^[0-9A-Za-z/\-_.]+\s*==?\s*[0-9A-Za-z/\-_.]+$/;
export const SELECTOR_OPERATOR_NOT_EQUALS_REGEX = /^[0-9A-Za-z/\-_.]+\s*!=\s*[0-9A-Za-z/\-_.]+$/;
export const SELECTOR_OPERATOR_IN_REGEX = /^[0-9A-Za-z/\-_.]+\s+in\s+\([0-9A-Za-z/\-_.,\s]+\)$/;
export const SELECTOR_OPERATOR_NOT_IN_REGEX =
  /^[0-9A-Za-z/\-_.]+\s+notin\s+\([0-9A-Za-z/\-_.,\s]+\)$/;
export const SELECTOR_OPERATOR_GREATER_THAN_REGEX = /^[0-9A-Za-z/\-_.]+\s+>\s+[0-9.]+$/;
export const SELECTOR_OPERATOR_LESS_THAN_REGEX = /^[0-9A-Za-z/\-_.]+\s+<\s+[0-9.]+$/;
