import { type FC, memo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getDescription } from '@kubevirt-utils/resources/shared';
import { getNoModalChangesTooltip } from '@kubevirt-utils/utils/text';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk-internal/lib/extensions/console-types';
import { TextArea } from '@patternfly/react-core';

import TabModal from '../TabModal/TabModal';

type DescriptionModalProps = {
  isOpen: boolean;
  obj: K8sResourceCommon;
  onClose: () => void;
  onSubmit: (description: string) => Promise<K8sResourceCommon | void>;
};

export const DescriptionModal: FC<DescriptionModalProps> = memo(
  ({ isOpen, obj, onClose, onSubmit }) => {
    const { t } = useKubevirtTranslation();
    const initialDescription = getDescription(obj);
    const [description, setDescription] = useState(initialDescription);

    return (
      <TabModal
        headerText={t('Description')}
        isDisabled={description === initialDescription}
        isOpen={isOpen}
        obj={obj}
        onClose={onClose}
        onSubmit={() => onSubmit(description)}
        submitDisabledTooltip={getNoModalChangesTooltip(t)}
      >
        <TextArea
          aria-label={t('description text area')}
          autoFocus
          defaultValue={initialDescription}
          onChange={(_event, value: string) => setDescription(value)}
          resizeOrientation="vertical"
          value={description}
        />
      </TabModal>
    );
  },
);
DescriptionModal.displayName = 'DescriptionModal';
