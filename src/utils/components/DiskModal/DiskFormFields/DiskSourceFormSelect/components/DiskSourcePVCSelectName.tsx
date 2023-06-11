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
  isDisabled?: boolean;
  onChange: React.Dispatch<React.SetStateAction<string>>;
  pvcNames: string[];
  pvcNameSelected: string;
  pvcsLoaded: boolean;
};

const DiskSourcePVCSelectName: React.FC<DiskSourcePVCSelectNameProps> = ({
  isDisabled,
  onChange,
  pvcNames,
  pvcNameSelected,
  pvcsLoaded,
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
    <FormGroup fieldId={fieldId} id={fieldId} isRequired label={t('PVC name')}>
      {pvcsLoaded ? (
        <Select
          aria-labelledby={fieldId}
          hasInlineFilter
          isDisabled={isDisabled}
          isOpen={isOpen}
          maxHeight={400}
          menuAppendTo="parent"
          onFilter={FilterPVCSelect(pvcNames)}
          onSelect={onSelect}
          onToggle={() => setSelectOpen(!isOpen)}
          placeholderText={t('--- Select PVC name ---')}
          selections={pvcNameSelected}
          variant={SelectVariant.single}
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
