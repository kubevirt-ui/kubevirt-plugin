import React from 'react';
import { useTranslation } from 'react-i18next';

import { useAccessReview } from '@console/internal/components/hooks';
import { useFlag, useIsMobile, useToast } from '@console/shared/src';
import { Button, ToolbarItem } from '@patternfly/react-core';

import { ALLOW_EXPORT_APP, EXPORT_CR_NAME } from '../../const';
import { ExportModel } from '../../models';

import { handleExportApplication } from './ExportApplicationModal';

type ExportApplicationProps = {
  namespace: string;
  isDisabled: boolean;
};

const ExportApplication: React.FC<ExportApplicationProps> = ({ namespace, isDisabled }) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const toast = useToast();
  const isExportAppAllowed = useFlag(ALLOW_EXPORT_APP);
  const canExportApp = useAccessReview({
    group: ExportModel.apiGroup,
    resource: ExportModel.plural,
    verb: 'create',
    namespace,
  });

  const showExportAppBtn = canExportApp && isExportAppAllowed && !isMobile;
  const name = EXPORT_CR_NAME;

  return showExportAppBtn ? (
    <ToolbarItem>
      <Button
        variant="secondary"
        data-test="export-app-btn"
        aria-label={t('kubevirt-plugin~Export application')}
        isDisabled={isDisabled}
        onClick={() => handleExportApplication(name, namespace, toast)}
      >
        {t('kubevirt-plugin~Export application')}
      </Button>
    </ToolbarItem>
  ) : null;
};

export default ExportApplication;
