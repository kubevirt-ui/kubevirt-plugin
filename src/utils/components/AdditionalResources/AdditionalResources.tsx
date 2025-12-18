import * as React from 'react';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import DescriptionItem from '../DescriptionItem/DescriptionItem';

type AdditionalResourcesProps = {
  template: V1Template;
};

const AdditionalResources: React.FC<AdditionalResourcesProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();

  const additionalResources: K8sResourceCommon[] = template?.objects?.filter(
    (object) => object?.kind !== VirtualMachineModel.kind,
  );

  if (isEmpty(additionalResources)) return null;

  return (
    <DescriptionItem
      descriptionData={
        <ul>
          {additionalResources.map((object) => (
            <li key={`${object?.kind}-${object?.metadata?.name}`}>{object?.kind}</li>
          ))}
        </ul>
      }
      descriptionHeader={t('Additional resources')}
    />
  );
};

export default AdditionalResources;
