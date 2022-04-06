import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk-internal/lib/extensions/console-types';
import { TextArea } from '@patternfly/react-core';

import TabModal from '../TabModal/TabModal';

type DescriptionModalProps = {
  obj: K8sResourceCommon;
  onSubmit: (description: string) => Promise<void | K8sResourceCommon>;
  isOpen: boolean;
  onClose: () => void;
};

export const DescriptionModal: React.FC<DescriptionModalProps> = React.memo(
  ({ isOpen, obj, onClose, onSubmit }) => {
    const { t } = useKubevirtTranslation();
    const [description, setDescription] = React.useState(obj?.metadata?.annotations?.description);

    // reset description when modal is closed
    React.useEffect(() => {
      setDescription(obj?.metadata?.annotations?.description);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    return (
      <TabModal
        obj={obj}
        onSubmit={() => onSubmit(description)}
        isOpen={isOpen}
        onClose={onClose}
        headerText={t('Description')}
      >
        <TextArea
          autoFocus
          defaultValue={obj?.metadata?.annotations?.description}
          value={description}
          onChange={setDescription}
          resizeOrientation="vertical"
          aria-label={t('description text area')}
        />
      </TabModal>
    );
  },
);
DescriptionModal.displayName = 'DescriptionModal';
