import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, Flex, FlexItem, FormGroup, Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

type CloneStorageCheckboxProps = {
  isChecked: boolean;
  onChange: (checked: boolean, event: React.FormEvent<HTMLInputElement>) => void;
};

const CloneStorageCheckbox: React.FC<CloneStorageCheckboxProps> = ({ isChecked, onChange }) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup fieldId="clone-storage">
      <Flex>
        <FlexItem>
          <Checkbox
            isChecked={isChecked}
            onChange={onChange}
            label={t("Copy template's boot source disk")}
            id="clone-storage"
          />
        </FlexItem>
        <FlexItem>
          <Popover
            aria-label={'Help'}
            bodyContent={() => (
              <div>
                {t(
                  'Checking this option will copy the template boot source disk, the new template will use the copy as its boot source',
                )}
              </div>
            )}
          >
            <HelpIcon />
          </Popover>
        </FlexItem>
      </Flex>
    </FormGroup>
  );
};

export default CloneStorageCheckbox;
