import * as React from 'react';
import { ANNOTATIONS } from 'src/views/templates/utils/constants';

import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk-internal/lib/extensions/console-types';
import { TextArea } from '@patternfly/react-core';

type DisplayNameModalProps = {
  isOpen: boolean;
  obj: K8sResourceCommon;
  onClose: () => void;
  onSubmit: (displayName: string) => Promise<K8sResourceCommon | void>;
};

const DisplayNameModal: React.FC<DisplayNameModalProps> = React.memo(
  ({ isOpen, obj, onClose, onSubmit }) => {
    const { t } = useKubevirtTranslation();
    const [displayName, setDisplayName] = React.useState(
      obj?.metadata?.annotations?.[ANNOTATIONS.displayName],
    );

    return (
      <TabModal
        headerText={t('Edit Display name')}
        isOpen={isOpen}
        obj={obj}
        onClose={onClose}
        onSubmit={() => onSubmit(displayName)}
      >
        <TextArea
          aria-label={t('display name text area')}
          autoFocus
          onChange={setDisplayName}
          resizeOrientation="vertical"
          value={displayName}
        />
      </TabModal>
    );
  },
);

export default DisplayNameModal;
