import * as React from 'react';
import { ANNOTATIONS } from 'src/views/templates/utils/constants';

import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk-internal/lib/extensions/console-types';
import { TextArea } from '@patternfly/react-core';

type DisplayNameModalProps = {
  obj: K8sResourceCommon;
  onSubmit: (displayName: string) => Promise<void | K8sResourceCommon>;
  isOpen: boolean;
  onClose: () => void;
};

const DisplayNameModal: React.FC<DisplayNameModalProps> = React.memo(
  ({ isOpen, obj, onClose, onSubmit }) => {
    const { t } = useKubevirtTranslation();
    const [displayName, setDisplayName] = React.useState(
      obj?.metadata?.annotations?.[ANNOTATIONS.displayName],
    );

    return (
      <TabModal
        obj={obj}
        onSubmit={() => onSubmit(displayName)}
        isOpen={isOpen}
        onClose={onClose}
        headerText={t('Edit Display name')}
      >
        <TextArea
          autoFocus
          value={displayName}
          onChange={setDisplayName}
          resizeOrientation="vertical"
          aria-label={t('display name text area')}
        />
      </TabModal>
    );
  },
);

export default DisplayNameModal;
