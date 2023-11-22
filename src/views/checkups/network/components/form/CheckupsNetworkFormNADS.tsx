import React, { ChangeEvent, Dispatch, FC, MouseEvent, SetStateAction, useState } from 'react';

import useNADsData from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/useNADsData';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

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
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const nadsItems = (nads || [])
    ?.filter((nad) => nad?.metadata?.namespace === namespace)
    ?.map((nad) => <SelectOption key={nad?.metadata?.uid} value={nad.metadata.name} />);

  return (
    <FormGroup fieldId="nad" isRequired label={t('NetworkAttachmentDefinition')}>
      <Select
        onSelect={(_: ChangeEvent | MouseEvent, value: string) => {
          setSelectedNAD(value);
          setIsOpen(false);
        }}
        isOpen={isOpen}
        onToggle={(value) => setIsOpen(value)}
        placeholderText="Select NetwrokAttachmentDefinition"
        selections={selectedNAD}
        variant={SelectVariant.typeahead}
      >
        {nadsItems}
      </Select>
    </FormGroup>
  );
};

export default CheckupsNetworkFormNADS;
