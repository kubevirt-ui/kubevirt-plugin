import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Text, TextVariants } from '@patternfly/react-core';

const NodeFieldsDescriptionText: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <Text className="text-muted" component={TextVariants.p}>
        {t(
          'Field selectors let you select Nodes based on the value of one or more resource fields.',
        )}
      </Text>
      <Text className="text-muted" component={TextVariants.p}>
        {t(
          'Note that for Node field expressions, entering a full path is required in the Key field (e.g. "metadata.name: value").',
        )}
      </Text>
      <Text className="text-muted" component={TextVariants.p}>
        {t('Some fields may not be supported.')}
      </Text>
    </>
  );
};
export default NodeFieldsDescriptionText;
