import React, { cloneElement, FCC, isValidElement, ReactElement, ReactNode } from 'react';

import { SPACE_SYMBOL } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type DescriptionItemPopoverContentProps = {
  bodyContent?: ReactNode;
  breadcrumb?: string;
  hide?: () => void;
  moreInfoURL?: string;
  olsObj?: K8sResourceCommon;
  promptType?: OLSPromptType;
};

const renderBodyContent = (bodyContent: ReactNode, hide: () => void): ReactNode => {
  if (isValidElement(bodyContent)) {
    return cloneElement(bodyContent as ReactElement, { hide });
  }
  return bodyContent;
};

const DescriptionItemPopoverContent: FCC<DescriptionItemPopoverContentProps> = ({
  bodyContent,
  breadcrumb,
  hide,
  moreInfoURL,
  olsObj,
  promptType,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <PopoverContentWithLightspeedButton
      content={
        <>
          {renderBodyContent(bodyContent, hide)}
          {moreInfoURL && (
            <>
              {SPACE_SYMBOL}
              {t('More info: ')}
              <a href={moreInfoURL}>{moreInfoURL}</a>
            </>
          )}
        </>
      }
      breadcrumb={breadcrumb}
      hide={hide}
      obj={olsObj}
      promptType={promptType}
    />
  );
};

export default DescriptionItemPopoverContent;
