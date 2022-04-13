import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Title } from '@patternfly/react-core';

type TemplatePageTitleTitleProps = {
  template: V1Template;
};

const TemplatePageTitle: React.FC<TemplatePageTitleTitleProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  return (
    <div className="co-m-nav-title co-m-nav-title--detail">
      <Title className="co-m-pane__heading" headingLevel="h1">
        <span className="co-resource-item__resource-name">
          <span className="co-m-resource-icon co-m-resource-icon--lg">{t('Template')}</span>
          <span className="co-resource-item__resource-name">{template?.metadata?.name}</span>
        </span>
        {/* <VirtualMachineActions vm={template} /> */}
      </Title>
    </div>
  );
};

export default TemplatePageTitle;
