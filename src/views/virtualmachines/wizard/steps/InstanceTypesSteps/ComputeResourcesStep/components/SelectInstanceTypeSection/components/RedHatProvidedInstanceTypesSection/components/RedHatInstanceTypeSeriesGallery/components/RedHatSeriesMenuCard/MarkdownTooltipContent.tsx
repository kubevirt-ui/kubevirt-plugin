import React, { type FC } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Stack } from '@patternfly/react-core';
import { MARKDOWN_BOLD_REGEX } from '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/components/RedHatProvidedInstanceTypesSection/components/RedHatInstanceTypeSeriesGallery/components/RedHatSeriesMenuCard/utils/constants';

type MarkdownTooltipContentProps = {
  content: string;
};

const MarkdownTooltipContent: FC<MarkdownTooltipContentProps> = ({ content }) => {
  if (isEmpty(content)) return null;

  const paragraphs = content.split('\n\n');

  return (
    <Stack hasGutter>
      {paragraphs.map((paragraph) => {
        const parts = paragraph.split(MARKDOWN_BOLD_REGEX);
        return (
          <p key={paragraph}>
            {parts.map((part) => {
              if (part.startsWith('*') && part.endsWith('*')) {
                return <strong key={part}>{part.slice(1, -1)}</strong>;
              }
              return part || null;
            })}
          </p>
        );
      })}
    </Stack>
  );
};

export default MarkdownTooltipContent;
