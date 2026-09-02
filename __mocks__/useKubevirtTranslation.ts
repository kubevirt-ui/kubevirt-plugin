import type { TFunction, TOptions } from 'i18next';

const interpolate = (key: string, options?: TOptions): string => {
  if (!options) {
    return key;
  }

  let result = key;
  for (const [name, value] of Object.entries(options)) {
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
      continue;
    }
    const replacement = String(value);
    result = result.replaceAll(`{{${name}}}`, replacement).replaceAll(`{{ ${name} }}`, replacement);
  }
  return result;
};

export const t = ((key: string, options?: TOptions) => interpolate(key, options)) as TFunction;

// Name must match the real hook so Jest module mocks resolve.
// eslint-disable-next-line @eslint-react/no-unnecessary-use-prefix
export const useKubevirtTranslation = (): { t: TFunction } => ({ t });
