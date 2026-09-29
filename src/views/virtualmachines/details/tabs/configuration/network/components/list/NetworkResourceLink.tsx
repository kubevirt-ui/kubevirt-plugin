import { type FC, type ReactNode } from 'react';
import { getVMNetworkType, getVMNetworkTypeLabel } from 'src/views/vmnetworks/list/utils';

import VerifiedResourceLink from '@kubevirt-utils/components/VerifiedResourceLink/VerifiedResourceLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-utils/models';
import { type NetworkAttachmentDefinitionKind } from '@kubevirt-utils/resources/nad/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

type NetworkResourceLinkProps = {
  cluster?: string;
  name: string;
  namespace: string;
};

const NetworkResourceLink: FC<NetworkResourceLinkProps> = ({ cluster, name, namespace }) => {
  const { t } = useKubevirtTranslation();

  const getTooltipContent = (resource: NetworkAttachmentDefinitionKind): ReactNode => (
    <DescriptionList isCompact>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Type')}</DescriptionListTerm>
        <DescriptionListDescription>
          {getVMNetworkTypeLabel(getVMNetworkType(resource), t)}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Namespace')}</DescriptionListTerm>
        <DescriptionListDescription>{namespace ?? NO_DATA_DASH}</DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );

  return (
    <VerifiedResourceLink
      cluster={cluster}
      groupVersionKind={NetworkAttachmentDefinitionModelGroupVersionKind}
      missingTooltip={t('This network resource has been deleted or cannot be found.')}
      name={name}
      namespace={namespace}
      tooltipContent={(resource) => getTooltipContent(resource as NetworkAttachmentDefinitionKind)}
    />
  );
};

export default NetworkResourceLink;
