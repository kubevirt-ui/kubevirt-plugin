import { useCallback } from 'react';

import useKubevirtToast from '@kubevirt-utils/hooks/useKubevirtToast';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { InvalidKeyError, InvalidValueError } from '@search/searchLanguage/types';

const useSearchValidationToast = () => {
  const { t } = useKubevirtTranslation();
  const { addWarningToast } = useKubevirtToast();

  return useCallback(
    (invalidKeyErrors: InvalidKeyError[], invalidValueErrors: InvalidValueError[]) => {
      const hasInvalidKeys = !isEmpty(invalidKeyErrors);
      const hasInvalidValues = !isEmpty(invalidValueErrors);

      if (!hasInvalidKeys && !hasInvalidValues) return;

      const messages: string[] = [];

      for (const { invalidValues, searchKey, validValues } of invalidValueErrors) {
        const badList = invalidValues.map((v) => `"${v}"`).join(', ');
        if (isEmpty(validValues)) {
          messages.push(
            t('{{badList}} is not a valid {{searchKey}} value.', { badList, searchKey }),
          );
        } else {
          messages.push(
            t('{{badList}} is not a valid {{searchKey}} value. Your search uses {{validList}}.', {
              badList,
              searchKey,
              validList: validValues.join(', '),
            }),
          );
        }
      }

      for (const { key } of invalidKeyErrors) {
        messages.push(
          t(
            '"{{key}}" is not a recognized filter. Choose a filter from the list or check your spelling.',
            { key },
          ),
        );
      }

      const getTitle = () => {
        if (hasInvalidKeys && hasInvalidValues) {
          return t("Some filters couldn't be applied");
        }
        if (hasInvalidKeys) {
          return t('Filter not recognized');
        }
        return t('Invalid filter value');
      };

      const title = getTitle();

      addWarningToast({
        content: messages.join('\n'),
        timeout: true,
        title,
      });
    },
    [t, addWarningToast],
  );
};

export default useSearchValidationToast;
