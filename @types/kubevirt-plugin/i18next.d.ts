import 'i18next';

declare module 'i18next' {
  /** @see https://www.i18next.com/overview/typescript#custom-type-options */
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- i18next module augmentation requires interface
  interface CustomTypeOptions {
    /**
     * This fixes an issue with react-i18next `Trans` component's string interpolation when
     * used in HTML elements.
     *
     * @example
     * ```tsx
     * <Trans t={t}>
     *   Hello <strong>{{ name }}</strong>
     * </Trans>
     * ```
     *
     * @see https://github.com/i18next/react-i18next/issues/1483#issuecomment-1827603003
     */
    allowObjectInHTMLChildren: true;
  }
}
