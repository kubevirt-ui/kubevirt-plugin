import React, { FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Flex, FlexItem, Switch, Title } from '@patternfly/react-core';

type LabelsAnnotationsHeaderProps = {
  isAdvancedView: boolean;
  toggleAdvancedView: (checked: boolean) => void;
};

const LabelsAnnotationsHeader: FC<LabelsAnnotationsHeaderProps> = ({
  isAdvancedView,
  toggleAdvancedView,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <Title headingLevel="h2">
        <SearchItem id="metadata">{t('Labels and annotations')}</SearchItem>
      </Title>
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        className="pf-v6-u-mt-sm pf-v6-u-mb-md"
        spaceItems={{ default: 'spaceItemsSm' }}
      >
        <FlexItem>
          <Switch
            onChange={(_event, checked) => toggleAdvancedView(checked)}
            data-test="advanced-view-toggle"
            id="advanced-view-toggle"
            isChecked={isAdvancedView}
            label={t('Show advanced view')}
          />
        </FlexItem>
        <FlexItem>
          <HelpTextIcon
            bodyContent={t(
              'Shows the classic metadata editor with editable label and annotation lists, similar to other OpenShift resource pages. The advanced view also includes system-managed labels and annotations.',
            )}
          />
        </FlexItem>
      </Flex>
    </>
  );
};

export default LabelsAnnotationsHeader;
