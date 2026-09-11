import { type FC } from 'react';

import { getName } from '@kubevirt-utils/resources/shared';
import { getTemplateName } from '@kubevirt-utils/resources/template/utils/selectors';
import { CatalogItemHeader } from '@patternfly/react-catalog-view-extension';
import { DrawerActions, DrawerCloseButton, DrawerHead } from '@patternfly/react-core';
import { getTemplateOSIcon } from '@virtualmachines/wizard/utils/os-icons/os-icons';

import { useDrawerContext } from '../hooks/useDrawerContext';

type TemplatesCatalogDrawerHeaderProps = {
  onClose: () => void;
};

const TemplatesCatalogDrawerHeader: FC<TemplatesCatalogDrawerHeaderProps> = ({ onClose }) => {
  const { clusterPreference, template } = useDrawerContext();
  const name = getName(template);
  const displayName = getTemplateName(template);
  const osIcon = getTemplateOSIcon(template, clusterPreference);

  return (
    <DrawerHead>
      <CatalogItemHeader
        className="co-catalog-page__overlay-header"
        iconImg={osIcon}
        title={name}
        vendor={displayName}
      />
      <DrawerActions>
        <DrawerCloseButton onClick={onClose} />
      </DrawerActions>
    </DrawerHead>
  );
};

export default TemplatesCatalogDrawerHeader;
