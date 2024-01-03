import React, { FC } from 'react';

import { SecretModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  HelperText,
  HelperTextItem,
  SplitItem,
} from '@patternfly/react-core';

type AuthorizedSSHKeyProps = {
  authorizedSSHKey: string;
  template: V1Template;
};
const AuthorizedSSHKey: FC<AuthorizedSSHKeyProps> = ({ authorizedSSHKey, template }) => {
  const { t } = useKubevirtTranslation();

  const additionalSecretResource: IoK8sApiCoreV1Secret = template?.objects?.find(
    (object) => object?.kind === SecretModel.kind,
  );

  return (
    !isEmpty(authorizedSSHKey) && (
      <SplitItem>
        <DescriptionList>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Public SSH key')}</DescriptionListTerm>
            <DescriptionListDescription>{authorizedSSHKey}</DescriptionListDescription>
            {!isEmpty(additionalSecretResource) && (
              <HelperText>
                <HelperTextItem hasIcon variant="warning">
                  {t('This key will override the SSH key secret set on the template')}
                </HelperTextItem>
              </HelperText>
            )}
          </DescriptionListGroup>
        </DescriptionList>
      </SplitItem>
    )
  );
};

export default AuthorizedSSHKey;
