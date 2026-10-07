import { type FC, memo, useState } from 'react';

import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getDisplayName } from '@kubevirt-utils/resources/shared';
import { getNoModalChangesTooltip } from '@kubevirt-utils/utils/text';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk-internal/lib/extensions/console-types';
import { TextArea } from '@patternfly/react-core';

type DisplayNameModalProps = {
  isOpen: boolean;
  obj: K8sResourceCommon;
  onClose: () => void;
  onSubmit: (displayName: string) => Promise<K8sResourceCommon | void>;
};

const DisplayNameModal: FC<DisplayNameModalProps> = memo(({ isOpen, obj, onClose, onSubmit }) => {
  const { t } = useKubevirtTranslation();
  const initialDisplayName = getDisplayName(obj);
  const [displayName, setDisplayName] = useState(initialDisplayName);

  return (
    <TabModal
      headerText={t('Edit display name')}
      isDisabled={displayName === initialDisplayName}
      isOpen={isOpen}
      obj={obj}
      onClose={onClose}
      onSubmit={() => onSubmit(displayName)}
      submitDisabledTooltip={getNoModalChangesTooltip(t)}
    >
      <TextArea
        aria-label={t('display name text area')}
        autoFocus
        onChange={(_event, value: string) => setDisplayName(value)}
        resizeOrientation="vertical"
        value={displayName}
      />
    </TabModal>
  );
});

export default DisplayNameModal;
