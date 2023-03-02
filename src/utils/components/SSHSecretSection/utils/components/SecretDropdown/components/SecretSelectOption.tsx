import React from 'react';

import { SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { getName } from '@kubevirt-utils/resources/shared';
import { getGroupVersionKindForModel, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { SelectOption } from '@patternfly/react-core';

type SecretSelectOptionProps = {
  key: string;
  secret: IoK8sApiCoreV1Secret;
};

const SecretSelectOption: React.FC<SecretSelectOptionProps> = ({ key, secret }) => {
  const secretName = getName(secret);
  return (
    <SelectOption key={key} value={secretName}>
      <ResourceLink groupVersionKind={getGroupVersionKindForModel(SecretModel)} name={secretName} />
    </SelectOption>
  );
};

export default SecretSelectOption;
