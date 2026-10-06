import type { FC } from 'react';
import { getVMTemplateBaseName } from 'src/views/templates/utils/selectors';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import VMTemplateLink from '@kubevirt-utils/components/VMTemplateLink/VMTemplateLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import type { Template } from '@kubevirt-utils/resources/template';
import { Content } from '@patternfly/react-core';

type BaseTemplateProps = {
  template: Template;
};

const BaseTemplate: FC<BaseTemplateProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const baseTemplate = getVMTemplateBaseName(template);

  return (
    <DescriptionItem
      descriptionData={
        baseTemplate ? (
          <VMTemplateLink {...baseTemplate} />
        ) : (
          <Content className="pf-v6-u-text-color-subtle" component="p">
            {t('Not available')}
          </Content>
        )
      }
      descriptionHeader={t('Base template')}
    />
  );
};

export default BaseTemplate;
