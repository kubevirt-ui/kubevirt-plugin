import React, { FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, Flex, FlexItem, FormGroup } from '@patternfly/react-core';

type CloneStorageCheckboxProps = {
  isChecked: boolean;
  onChange: (checked: boolean) => void;
};

const CloneStorageCheckbox: FC<CloneStorageCheckboxProps> = ({ isChecked, onChange }) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup fieldId="clone-storage">
      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
        <FlexItem>
          <Checkbox
            id="clone-storage"
            isChecked={isChecked}
            label={t("Copy template's boot source disk")}
            onChange={(_, checked: boolean) => onChange(checked)}
          />
        </FlexItem>
        <FlexItem>
          <HelpTextIcon
            bodyContent={
              <div>
                {t(
                  'Checking this option will create a new PVC of the bootsource for the new template',
                )}
              </div>
            }
          />
        </FlexItem>
      </Flex>
    </FormGroup>
  );
};

export default CloneStorageCheckbox;
