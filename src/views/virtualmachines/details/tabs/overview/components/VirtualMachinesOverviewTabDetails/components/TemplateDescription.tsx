import React, { FC } from 'react';

import { modelToGroupVersionKind, TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { LABEL_USED_TEMPLATE_NAMESPACE } from '@kubevirt-utils/resources/template';
import { VM_TEMPLATE_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

type TemplateDescriptionProps = {
  vm: V1VirtualMachine;
};

const TemplateDescription: FC<TemplateDescriptionProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const templateName = getLabel(vm, VM_TEMPLATE_ANNOTATION);
  const templateNamespace = getLabel(vm, LABEL_USED_TEMPLATE_NAMESPACE);
  const None = <MutedTextSpan text={t('None')} />;

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{t('Template')}</DescriptionListTerm>
      <DescriptionListDescription data-test-id="virtual-machine-overview-details-template">
        {templateName && templateNamespace ? (
          <ResourceLink
            groupVersionKind={modelToGroupVersionKind(TemplateModel)}
            name={templateName}
            namespace={templateNamespace}
          />
        ) : (
          None
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default TemplateDescription;
