import * as React from 'react';

import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type CreateAtProps = {
  timestamp: string;
};

const CreateAt: React.FC<CreateAtProps> = ({ timestamp }) => {
  const { t } = useKubevirtTranslation();
  return (
    <VirtualMachineDescriptionItem
      bodyContent={t(
        'CreationTimestamp is a timestamp representing the server time when this object was created. It is not guaranteed to be set in happens-before order across separate operations. Clients may not set this value. It is represented in RFC3339 form and is in UTC.',
      )}
      breadcrumb="VirtualMachineInstance.metadata.creationTimestamp"
      descriptionData={<Timestamp timestamp={timestamp} />}
      descriptionHeader={t('Created at')}
      isPopover
      moreInfoURL="https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata"
    />
  );
};

export default CreateAt;
