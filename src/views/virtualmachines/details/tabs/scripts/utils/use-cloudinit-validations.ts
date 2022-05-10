import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import {
  checkHostname,
  checkName,
  checkPassword,
  checkSSHKeys,
  checkUser,
  ErrorCatcher,
  ValidationStatus,
} from './cloudint-utils';

const useCloudinitValidations = () => {
  const { t } = useKubevirtTranslation();
  const [validationStatus, setValidationStatus] = React.useState<ValidationStatus>({});
  const [isValid, setIsValid] = React.useState<boolean>();
  const validationSchema = React.useCallback(
    (obj: { [key: string]: string | string[] }) => {
      const errorCatcher = new ErrorCatcher();

      [checkUser, checkPassword, checkHostname, checkSSHKeys, checkName].forEach((func) =>
        func(obj, errorCatcher, t),
      );

      setValidationStatus(errorCatcher.getErrors());
      setIsValid(errorCatcher.isValid);
    },
    [t],
  );

  return { validationSchema, validationStatus, isValid };
};

export default useCloudinitValidations;
