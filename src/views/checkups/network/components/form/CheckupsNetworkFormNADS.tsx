import React, { Dispatch, FC, MouseEvent, SetStateAction } from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import useNADsData from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/useNADsData';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, SelectOption } from '@patternfly/react-core';

type CheckupsNetworkFormNADSProps = {
  selectedNAD: string;
  setSelectedNAD: Dispatch<SetStateAction<string>>;
};
const CheckupsNetworkFormNADS: FC<CheckupsNetworkFormNADSProps> = ({
  selectedNAD,
  setSelectedNAD,
}) => {
  const { t } = useKubevirtTranslation();
  const [namespace] = useActiveNamespace();
  const { nads } = useNADsData(namespace);

  const nadsItems = (nads || [])
    ?.filter((nad) => nad?.metadata?.namespace === namespace)
    ?.map((nad) => (
      <SelectOption key={nad?.metadata?.uid} value={nad.metadata.name}>
        {nad.metadata.name}
      </SelectOption>
    ));

  return (
    <FormGroup fieldId="nad" isRequired label={t('NetworkAttachmentDefinition')}>
      <FormPFSelect
        className="placeholder"
        onSelect={(_: MouseEvent, value: string) => setSelectedNAD(value)}
        selected={selectedNAD}
        toggleProps={{ isFullWidth: true, placeholder: t('Select NetwrokAttachmentDefinition') }}
      >
        {nadsItems}
      </FormPFSelect>
    </FormGroup>
  );
};

export default CheckupsNetworkFormNADS;
