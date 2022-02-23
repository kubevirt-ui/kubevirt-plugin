import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button } from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

type RightHeadingProps = {
  template: V1Template;
};

export const RightHeader: React.FC<RightHeadingProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  if (!template?.metadata?.annotations) return null;

  const displayName = template.metadata?.annotations['openshift.io/display-name'];
  const documentationLink = template.metadata?.annotations['openshift.io/documentation-url'];
  const description = template.metadata?.annotations?.description;
  return (
    <div className="co-catalog-item-info customize-vm__right-header">
      <div>
        <h2 className="co-section-heading co-catalog-item-details__name">{displayName}</h2>
        {documentationLink && (
          <div>
            <Button
              variant="link"
              icon={<ExternalLinkAltIcon />}
              href={documentationLink}
              target="_blank"
              component="a"
              iconPosition="right"
              className="pf-u-pl-0"
            >
              {t('View documentation')}
            </Button>
          </div>
        )}
      </div>
      {description && <p className="co-catalog-item-details__description">{description}</p>}
    </div>
  );
};
