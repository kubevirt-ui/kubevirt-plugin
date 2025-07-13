import React, { FC } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem } from '@patternfly/react-core';

import './HelpTextTooltipContent.scss';

type HelpTextTooltipContentProps = {
  bodyText: string;
  linkURL?: string;
  titleText?: string;
};

const HelpTextTooltipContent: FC<HelpTextTooltipContentProps> = ({
  bodyText,
  linkURL,
  titleText,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Stack className="feature-wizard-help-text-content" hasGutter>
      <StackItem>
        <h3 className="feature-wizard-help-text-content__title">{titleText}</h3>
      </StackItem>
      <StackItem>{bodyText}</StackItem>
      {linkURL && (
        <StackItem>
          <ExternalLink href={linkURL}>{t('Read more')}</ExternalLink>
        </StackItem>
      )}
    </Stack>
  );
};

export default HelpTextTooltipContent;
