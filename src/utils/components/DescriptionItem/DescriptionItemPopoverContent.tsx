import React, { cloneElement, FC, isValidElement, ReactElement, ReactNode } from 'react';

import { SPACE_SYMBOL } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import LightspeedHelpButton from '@lightspeed/components/LightspeedHelpButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Breadcrumb, BreadcrumbItem, Split, SplitItem } from '@patternfly/react-core';

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
    <>
      {isValidElement(bodyContent) && cloneElement(bodyContent as ReactElement, { hide })}
      {moreInfoURL && (
        <>
          {SPACE_SYMBOL}
          {t('More info: ')}
          <a href={moreInfoURL}>{moreInfoURL}</a>
        </>
      )}
      <Split className="pf-v6-u-mt-md">
        <SplitItem>
          {breadcrumb && (
            <Breadcrumb>
              {breadcrumb.split('.').map((item) => (
                <BreadcrumbItem key={item}>{item}</BreadcrumbItem>
              ))}
            </Breadcrumb>
          )}
        </SplitItem>
        <SplitItem isFilled />
        <SplitItem>
          {promptType && (
            <LightspeedHelpButton obj={olsObj} onClick={hide} promptType={promptType} />
          )}
        </SplitItem>
      </Split>
    </>
  );
};

export default DescriptionItemPopoverContent;
