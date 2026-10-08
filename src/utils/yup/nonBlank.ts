import * as yup from 'yup';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

declare module 'yup' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Module augmentation requires an interface.
  interface StringSchema {
    nonBlank(): this;
  }
}

yup.addMethod(yup.string, 'nonBlank', function (): ReturnType<typeof yup.string> {
  return this.test({
    message: () => t('This field is required'),
    name: 'nonBlank',
    skipAbsent: true,
    test: (value) => value == null || value.trim().length > 0,
  });
});
