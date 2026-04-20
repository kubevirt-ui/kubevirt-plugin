import React, { FCC } from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const PowerfulShortcutsContent: FCC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Trans t={t}>
      Manage your VMs instantly by right-clicking on them. Access <b>Control</b> and migration
      tools, <b>save as a template</b>, or <b>move to a folder</b> without leaving your current
      view.
    </Trans>
  );
};

export default PowerfulShortcutsContent;
