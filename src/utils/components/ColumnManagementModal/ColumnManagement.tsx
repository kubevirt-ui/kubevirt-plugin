import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ColumnLayout } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, ToolbarItem, Tooltip } from '@patternfly/react-core';
import { ColumnsIcon } from '@patternfly/react-icons';

import { ColumnManagementModal } from '../ColumnManagementModal/ColumnManagementModal';
import { useModal } from '../ModalProvider/ModalProvider';

type ColumnManagementProps = {
  /** When true, renders as a PatternFly ToolbarItem (use inside TableToolbarActionsGroup). */
  asToolbarItem?: boolean;
  columnLayout: ColumnLayout;
  hideColumnManagement?: boolean;
};

const ColumnManagement: FC<ColumnManagementProps> = ({
  asToolbarItem = false,
  columnLayout,
  hideColumnManagement,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  if (isEmpty(columnLayout) || !columnLayout?.id || hideColumnManagement) {
    return null;
  }

  const button = (
    <Tooltip content={t('Manage columns')} trigger="mouseenter focus">
      <Button
        onClick={() =>
          createModal((props) => <ColumnManagementModal {...props} columnLayout={columnLayout} />)
        }
        aria-label={t('Column management')}
        className={asToolbarItem ? undefined : 'kubevirt-table-toolbar-action'}
        data-test="manage-columns"
        icon={<ColumnsIcon />}
        variant={ButtonVariant.plain}
      />
    </Tooltip>
  );

  if (asToolbarItem) {
    return <ToolbarItem>{button}</ToolbarItem>;
  }

  return button;
};

export default ColumnManagement;
