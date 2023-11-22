import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk-internal/lib/extensions/console-types';
import { TextArea } from '@patternfly/react-core';

import TabModal from '../TabModal/TabModal';

type DescriptionModalProps = {
  isOpen: boolean;
  obj: K8sResourceCommon;
  onClose: () => void;
  onSubmit: (description: string) => Promise<K8sResourceCommon | void>;
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
        headerText={t('Description')}
        isOpen={isOpen}
        obj={obj}
        onClose={onClose}
        onSubmit={() => onSubmit(description)}
      >
        <TextArea
          aria-label={t('description text area')}
          autoFocus
          defaultValue={obj?.metadata?.annotations?.description}
          onChange={setDescription}
          resizeOrientation="vertical"
          value={description}
        />
      </TabModal>
    );
  },
);
DescriptionModal.displayName = 'DescriptionModal';
