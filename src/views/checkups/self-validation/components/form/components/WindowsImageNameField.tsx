import React, { FC } from 'react';

import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  FormGroup,
  HelperText,
  HelperTextItem,
  StackItem,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';

type WindowsImageNameFieldProps = {
  dataSourceOptions: EnhancedSelectOptionProps[];
  dataSourcesError: boolean;
  dataSourcesLoaded: boolean;
  setWinImageName: (name: string) => void;
  winImageName: string;
};

const WindowsImageNameField: FC<WindowsImageNameFieldProps> = ({
  dataSourceOptions,
  dataSourcesError,
  dataSourcesLoaded,
  setWinImageName,
  winImageName,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <StackItem className="pf-v6-u-pl-lg">
      <FormGroup
        className="form-group-spacing"
        fieldId="win-image-name"
        label={t('Windows image name')}
      >
        {!dataSourcesLoaded && <Loading />}
        {dataSourcesLoaded && dataSourcesError && (
          <HelperText className="checkups-self-validation-form__helper-text">
            <HelperTextItem variant="error">
              {t('Failed to load Windows DataSources. Check your permissions.')}
            </HelperTextItem>
          </HelperText>
        )}
        {dataSourcesLoaded && !dataSourcesError && isEmpty(dataSourceOptions) && (
          <>
            <InlineFilterSelect
              toggleProps={{
                isDisabled: true,
                isFullWidth: true,
              }}
              options={dataSourceOptions}
              placeholder={t('Select a Windows DataSource')}
              selected={winImageName}
              setSelected={setWinImageName}
            />
            <HelperText className="checkups-self-validation-form__helper-text">
              <HelperTextItem variant="warning">
                {t('No Windows DataSources found in the cluster')}
              </HelperTextItem>
            </HelperText>
          </>
        )}
        {dataSourcesLoaded && !dataSourcesError && !isEmpty(dataSourceOptions) && (
          <div className="win-image-name-select">
            <InlineFilterSelect
              options={dataSourceOptions}
              placeholder={t('Select a Windows DataSource')}
              selected={winImageName}
              setSelected={setWinImageName}
              toggleProps={{ isFullWidth: true }}
            />
            {winImageName && (
              <Button
                aria-label={t('Clear selection')}
                className="win-image-name-select__clear"
                data-test="win-image-name-clear"
                icon={<TimesIcon />}
                onClick={() => setWinImageName('')}
                variant={ButtonVariant.plain}
              />
            )}
          </div>
        )}
        <HelperText className="checkups-self-validation-form__helper-text">
          <HelperTextItem>
            {t(
              'Selecting an existing Windows DataSource will skip the golden image creation (optional).',
            )}
          </HelperTextItem>
        </HelperText>
        {!winImageName && (
          <Alert
            className="pf-v6-u-mt-sm"
            isInline
            title={t('Initial Windows image creation may take 60-90 minutes.')}
            variant={AlertVariant.info}
          >
            {t('Subsequent runs will skip this step if the golden image already exists.')}
          </Alert>
        )}
      </FormGroup>
    </StackItem>
  );
};

export default WindowsImageNameField;
