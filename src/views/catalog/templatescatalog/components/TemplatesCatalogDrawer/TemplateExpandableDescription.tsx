import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ExpandableSection, Stack, StackItem } from '@patternfly/react-core';

const TemplateExpandableDescription: FC<{ description: string }> = ({ description }) => {
  const { t } = useKubevirtTranslation();
  const [isExpanded, setIsExpanded] = useState(description?.length <= 120);

  return (
    <Stack className="template-catalog-drawer-description">
      <StackItem>
        <ExpandableSection isExpanded isDetached contentId="expandable-content">
          {isExpanded ? description : description.slice(0, 120).concat('...')}
        </ExpandableSection>
      </StackItem>
      {description.length > 120 && (
        <StackItem>
          <Button isInline variant="link" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? t('Collapse') : t('Read more')}
          </Button>
        </StackItem>
      )}
    </Stack>
  );
};

export default TemplateExpandableDescription;
