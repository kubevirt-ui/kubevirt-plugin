import { type JSX, useMemo } from 'react';
import { Trans } from 'react-i18next';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant, FormGroup, PopoverPosition } from '@patternfly/react-core';
import { SimpleSelect } from '@patternfly/react-templates';

import { getSkipTeardownOptions, type SkipTeardownOption } from '../../utils/utils';

type SkipTeardownFieldProps = {
  onSkipTeardownChange: (value: SkipTeardownOption) => void;
  skipTeardown: SkipTeardownOption;
};

const SkipTeardownField = ({
  onSkipTeardownChange,
  skipTeardown,
}: SkipTeardownFieldProps): JSX.Element => {
  const { t } = useKubevirtTranslation();
  const skipTeardownOptions = useMemo(() => getSkipTeardownOptions(t), [t]);

  return (
    <>
      <FormGroup
        className="form-group-spacing"
        fieldId="skip-teardown"
        label={t('Skip teardown')}
        labelHelp={
          <HelpTextIcon
            bodyContent={t(
              'Controls whether the teardown steps should be skipped after checkup completion',
            )}
            buttonAriaLabel={t('Help for skip teardown')}
            position={PopoverPosition.right}
          />
        }
      >
        <SimpleSelect
          id="skip-teardown"
          initialOptions={skipTeardownOptions}
          onSelect={(_event, value: SkipTeardownOption) => onSkipTeardownChange(value)}
          selected={skipTeardown}
        />
      </FormGroup>
      {skipTeardown !== 'never' && (
        <Alert
          className="form-group-spacing"
          isInline
          title={t('Warning: Manual cleanup required')}
          variant={AlertVariant.warning}
        >
          <Trans ns="plugin__kubevirt-plugin" t={t}>
            When teardown is skipped, you will be responsible for manually cleaning up the
            VirtualMachines, DataVolumes, and PersistentVolumeClaims created by the checkup job.
          </Trans>
        </Alert>
      )}
    </>
  );
};

export default SkipTeardownField;
