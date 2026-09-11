import { type FC, type ReactElement } from 'react';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isOpenShiftTemplate, type Template } from '@kubevirt-utils/resources/template';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import DescriptionItem from '../DescriptionItem/DescriptionItem';

type AdditionalResourcesProps = {
  template: Template;
};

const AdditionalResources: FC<AdditionalResourcesProps> = ({ template }): ReactElement | null => {
  const { t } = useKubevirtTranslation();

  const additionalResources: K8sResourceCommon[] = isOpenShiftTemplate(template)
    ? (template?.objects as K8sResourceCommon[])?.filter(
        (object) => object?.kind !== VirtualMachineModel.kind,
      )
    : [];

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
