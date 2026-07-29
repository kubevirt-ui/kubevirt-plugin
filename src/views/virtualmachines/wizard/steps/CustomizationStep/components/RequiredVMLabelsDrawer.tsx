import React, { FC } from 'react';

import { AutoAppliedLabel } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import { WIZARD_DRAWER_SIZE } from '@settings/constants';

import RequiredVMLabelsDrawerBody from './RequiredVMLabelsDrawerBody';

type RequiredVMLabelsDrawerProps = {
  onClose: () => void;
  requiredLabels: AutoAppliedLabel[];
  vmLabels: Record<string, string>;
};

const RequiredVMLabelsDrawer: FC<RequiredVMLabelsDrawerProps> = ({
  onClose,
  requiredLabels,
  vmLabels,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <DrawerPanelContent maxSize={WIZARD_DRAWER_SIZE} minSize={WIZARD_DRAWER_SIZE}>
      <DrawerHead>
        <Title headingLevel="h2" size={TitleSizes.lg}>
          {t('Required VM labels')}
        </Title>
        <DrawerActions>
          <DrawerCloseButton onClick={onClose} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        <RequiredVMLabelsDrawerBody requiredLabels={requiredLabels} vmLabels={vmLabels} />
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default RequiredVMLabelsDrawer;
