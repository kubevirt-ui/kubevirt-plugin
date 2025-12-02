import React, { FC, memo } from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { updateTemplate } from '@kubevirt-utils/resources/template/utils';
import { Grid, GridItem, PageSection, Title } from '@patternfly/react-core';

import useEditTemplateAccessReview from '../../hooks/useIsTemplateEditable';

import TemplateSchedulingLeftGrid from './components/TemplateSchedulingLeftGrid';
import TemplateSchedulingRightGrid from './components/TemplateSchedulingRightGrid';

import './TemplateSchedulingTab.scss';

type TemplateSchedulingTabProps = {
  obj?: V1Template;
};

const TemplateSchedulingTab: FC<TemplateSchedulingTabProps> = ({ obj: template }) => {
  const { isTemplateEditable } = useEditTemplateAccessReview(template);
  const { t } = useKubevirtTranslation();

  return (
    <PageSection>
      <SidebarEditor<V1Template> onResourceUpdate={updateTemplate} resource={template}>
        <>
          <Title headingLevel="h2">{t('Scheduling and resource requirements')}</Title>
          <Grid className="margin-top">
            <GridItem span={5}>
              <TemplateSchedulingLeftGrid editable={isTemplateEditable} template={template} />
            </GridItem>
            <GridItem lg={1}></GridItem>
            <GridItem span={5}>
              <TemplateSchedulingRightGrid editable={isTemplateEditable} template={template} />
            </GridItem>
          </Grid>
        </>
      </SidebarEditor>
    </PageSection>
  );
};

export default memo(TemplateSchedulingTab) as FC<TemplateSchedulingTabProps>;
