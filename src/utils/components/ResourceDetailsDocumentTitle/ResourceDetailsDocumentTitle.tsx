import { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DocumentTitle } from '@openshift-console/dynamic-plugin-sdk';

type ResourceDetailsDocumentTitleProps = {
  name: string | undefined;
  resourceKind: string;
};

const ResourceDetailsDocumentTitle: FC<ResourceDetailsDocumentTitleProps> = ({
  name,
  resourceKind,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <DocumentTitle>
      {t('{{name}} · {{resourceKind}} · Details', { name, resourceKind })}
    </DocumentTitle>
  );
};

export default ResourceDetailsDocumentTitle;
