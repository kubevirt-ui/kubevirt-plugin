import * as React from 'react';
import { getVMTemplateBaseName } from 'src/views/templates/utils/selectors';

import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, TemplateModel, V1Template } from '@kubevirt-utils/models';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Text } from '@patternfly/react-core';

type BaseTemplateProps = {
  template: V1Template;
};

const BaseTemplate: React.FC<BaseTemplateProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const baseTemplate = getVMTemplateBaseName(template);

  return (
    <VirtualMachineDescriptionItem
      descriptionData={
        baseTemplate ? (
          <ResourceLink
            groupVersionKind={modelToGroupVersionKind(TemplateModel)}
            {...baseTemplate}
          />
        ) : (
          <Text className="text-muted">{t('Not available')}</Text>
        )
      }
      descriptionHeader={t('Base template')}
    />
  );
};

export default BaseTemplate;
