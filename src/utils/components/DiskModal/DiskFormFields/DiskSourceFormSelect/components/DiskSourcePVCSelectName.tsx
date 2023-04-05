import * as React from 'react';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui/kubevirt-api/console';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, Select, SelectOption, SelectVariant, Truncate } from '@patternfly/react-core';

import { FilterPVCSelect } from '../../utils/Filters';

type DiskSourcePVCSelectNameProps = {
  pvcNameSelected: string;
  pvcNames: string[];
  onChange: React.Dispatch<React.SetStateAction<string>>;
  pvcsLoaded: boolean;
  isDisabled?: boolean;
};

const DiskSourcePVCSelectName: React.FC<DiskSourcePVCSelectNameProps> = ({
  pvcNameSelected,
  pvcNames,
  onChange,
  pvcsLoaded,
  isDisabled,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setSelectOpen] = React.useState(false);

  const onSelect = React.useCallback(
    (event, selection) => {
      onChange(selection);
      setSelectOpen(false);
    },
    [onChange],
  );

  const fieldId = 'pvc-name-select';

  return (
    <FormGroup label={t('PVC name')} fieldId={fieldId} id={fieldId} isRequired>
      {pvcsLoaded ? (
        <Select
          menuAppendTo="parent"
          aria-labelledby={fieldId}
          isOpen={isOpen}
          onToggle={() => setSelectOpen(!isOpen)}
          onSelect={onSelect}
          variant={SelectVariant.single}
          hasInlineFilter
          selections={pvcNameSelected}
          onFilter={FilterPVCSelect(pvcNames)}
          placeholderText={t('--- Select PVC name ---')}
          isDisabled={isDisabled}
          maxHeight={400}
        >
          {pvcNames.map((name) => (
            <SelectOption key={name} value={name}>
              <ResourceLink
                groupVersionKind={modelToGroupVersionKind(PersistentVolumeClaimModel)}
                linkTo={false}
              >
                <Truncate content={name} />
              </ResourceLink>
            </SelectOption>
          ))}
        </Select>
      ) : (
        <Loading />
      )}
    </FormGroup>
  );
};

export default DiskSourcePVCSelectName;
