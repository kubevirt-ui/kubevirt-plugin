import React, { FC } from 'react';

import { modelToGroupVersionKind, TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { LABEL_USED_TEMPLATE_NAMESPACE } from '@kubevirt-utils/resources/template';
import { VM_TEMPLATE_ANNOTATION } from '@kubevirt-utils/resources/vm';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';

type TemplateDescriptionProps = {
  vm: V1VirtualMachine;
};

const TemplateDescription: FC<TemplateDescriptionProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const templateName = getLabel(vm, VM_TEMPLATE_ANNOTATION);
  const templateNamespace = getLabel(vm, LABEL_USED_TEMPLATE_NAMESPACE);
  const None = <MutedTextSpan text={t('None')} />;

  return (
    <DescriptionItem
      descriptionData={
        templateName && templateNamespace ? (
          <MulticlusterResourceLink
            cluster={getCluster(vm)}
            groupVersionKind={modelToGroupVersionKind(TemplateModel)}
            name={templateName}
            namespace={templateNamespace}
          />
        ) : (
          None
        )
      }
      data-test-id="virtual-machine-overview-details-template"
      descriptionHeader={t('Template')}
    />
  );
};

export default TemplateDescription;
