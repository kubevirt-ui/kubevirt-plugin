import type { FC, FormEvent, ReactNode } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, Flex, FlexItem } from '@patternfly/react-core';

type ThisIsAnIsoFileCheckboxProps = {
  helpBody?: ReactNode;
  id?: string;
  isChecked: boolean;
  isDisabled?: boolean;
  onChange: (checked: boolean) => void;
};

const ThisIsAnIsoFileCheckbox: FC<ThisIsAnIsoFileCheckboxProps> = ({
  helpBody,
  id = 'this-is-an-iso-file',
  isChecked,
  isDisabled,
  onChange,
}) => {
  const { t } = useKubevirtTranslation();
  const labelText = t('This is an ISO file');

  return (
    <Checkbox
      data-test="this-is-an-iso-file-checkbox"
      id={id}
      isChecked={isChecked}
      isDisabled={isDisabled}
      label={
        helpBody ? (
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            spaceItems={{ default: 'spaceItemsSm' }}
          >
            <FlexItem>{labelText}</FlexItem>
            <FlexItem>
              <HelpTextIcon bodyContent={helpBody} headerContent={labelText} />
            </FlexItem>
          </Flex>
        ) : (
          labelText
        )
      }
      onChange={(_event: FormEvent<HTMLInputElement>, checked: boolean) => onChange(checked)}
    />
  );
};

export default ThisIsAnIsoFileCheckbox;
