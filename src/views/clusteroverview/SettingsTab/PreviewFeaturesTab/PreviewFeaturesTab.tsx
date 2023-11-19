import React, { FC, useState } from 'react';

import EnableFeatureCheckboxControlled from '@kubevirt-utils/components/EnableFeatureCheckbox/EnableFeatureCheckboxConrolled';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  DropdownToggleCheckbox,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import usePreviewFeaturesData from './hooks/usePreviewFeaturesData';
import PreviewFeaturesPopover from './PreviewFeaturesPopover';

import './PreviewFeatures.scss';

const PreviewFeaturesTab: FC = () => {
  const { t } = useKubevirtTranslation();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { canEditAll, features, isEnabledAll, loading, togglers } = usePreviewFeaturesData();

  const onChange = async (val: boolean) => {
    setIsOpen(false);
    for (const toggler of togglers) {
      await toggler(val);
    }
  };

  return (
    <>
      <Title headingLevel="h5">
        {t('Preview features')}
        <PreviewFeaturesPopover />
      </Title>
      <Stack hasGutter>
        <StackItem isFilled>
          {t(
            'Preview features are for testing purposes and should not be used in production environments.',
          )}
        </StackItem>
        <StackItem isFilled>
          <Dropdown
            dropdownItems={[
              <DropdownItem key="all" onClick={() => onChange(true)}>
                {t('All')}
              </DropdownItem>,
              <DropdownItem key="none" onClick={() => onChange(false)}>
                {t('None')}
              </DropdownItem>,
            ]}
            toggle={
              <DropdownToggle
                splitButtonItems={[
                  <DropdownToggleCheckbox
                    aria-label="toggle-checkbox"
                    id="toggle-checkbox"
                    isChecked={isEnabledAll}
                    isDisabled={!canEditAll}
                    isInProgress={loading}
                    key="progress-checkbox"
                    onChange={onChange}
                  />,
                ]}
                id="toggle-progress"
                onToggle={setIsOpen}
              />
            }
            className="PreviewFeaturesTab--control_checkbox"
            isOpen={isOpen}
          />
        </StackItem>
        {features.map((feature) => (
          <StackItem isFilled key={feature.id}>
            <EnableFeatureCheckboxControlled {...feature} loading={loading} />
          </StackItem>
        ))}
      </Stack>
    </>
  );
};

export default PreviewFeaturesTab;
