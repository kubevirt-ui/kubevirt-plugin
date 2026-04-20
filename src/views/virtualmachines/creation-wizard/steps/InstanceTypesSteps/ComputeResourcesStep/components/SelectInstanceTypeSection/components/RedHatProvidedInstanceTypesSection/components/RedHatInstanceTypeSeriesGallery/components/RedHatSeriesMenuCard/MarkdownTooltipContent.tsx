import React, { FCC } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Stack } from '@patternfly/react-core';
import { MARKDOWN_BOLD_REGEX } from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/components/RedHatProvidedInstanceTypesSection/components/RedHatInstanceTypeSeriesGallery/components/RedHatSeriesMenuCard/utils/constants';

type MarkdownTooltipContentProps = {
  content: string;
};

const MarkdownTooltipContent: FCC<MarkdownTooltipContentProps> = ({ content }) => {
  if (isEmpty(content)) return null;

  return (
    <Stack hasGutter>
      {content.split('\n\n').map((paragraph, paragraphIdx) => (
        <p key={`paragraph-${paragraphIdx}`}>
          {paragraph.split(MARKDOWN_BOLD_REGEX).map((part, partIdx) => {
            if (part.startsWith('*') && part.endsWith('*')) {
              return <strong key={`part-${paragraphIdx}-${partIdx}`}>{part.slice(1, -1)}</strong>;
            }
            return part || null;
          })}
        </p>
      ))}
    </Stack>
  );
};

export default MarkdownTooltipContent;
