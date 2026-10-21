import React, { cloneElement, FC, isValidElement, ReactElement, ReactNode } from 'react';

import { SPACE_SYMBOL } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import LightspeedSimplePopoverContent from '@lightspeed/components/LightspeedSimplePopoverContent';
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

const DescriptionItemPopoverContent: FC<DescriptionItemPopoverContentProps> = ({
  bodyContent,
  breadcrumb,
  hide,
  moreInfoURL,
  olsObj,
  promptType,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <LightspeedSimplePopoverContent
      content={
        <>
          {isValidElement(bodyContent) && cloneElement(bodyContent as ReactElement, { hide })}
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
