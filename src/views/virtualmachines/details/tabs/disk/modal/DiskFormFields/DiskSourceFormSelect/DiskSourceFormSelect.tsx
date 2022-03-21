import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS, OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { diskTypes } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { hasSizeUnit as getOSNameWithoutVersionNumber } from '@kubevirt-utils/resources/vm/utils/disk/size';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { diskReducerActions } from '../../reducer/actions';
import { DiskFormState } from '../../reducer/initialState';
import { sourceTypes } from '../utils/constants';
import { getSourceOptions } from '../utils/helpers';

import DiskSourceContainer from './components/DiskSourceContainer';
import DiskSourcePVCSelect from './components/DiskSourcePVCSelect';
import DiskSourceUrlInput from './components/DiskSourceUrlInput';

type DiskSourceFormSelectProps = {
  vm: V1VirtualMachine;
  diskState: DiskFormState;
  dispatch: React.Dispatch<any>;
  isVMRunning: boolean;
};

const DiskSourceFormSelect: React.FC<DiskSourceFormSelectProps> = ({
  vm,
  diskState,
  dispatch,
  isVMRunning,
}) => {
  const { t } = useKubevirtTranslation();
  const { diskSource, diskType } = diskState || {};
  const isCDROMType = diskType === diskTypes.cdrom;
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [urlSource, setURLSource] = React.useState<string>();
  const [pvcSourceName, setPVCSourceName] = React.useState<string>();
  const [pvcCloneSourceName, setPVCCloneSourceName] = React.useState<string>();
  const [pvcCloneSourceNamespace, setPVCCloneSourceNamespace] = React.useState<string>();
  const [registerySource, setRegisterySource] = React.useState<string>();
  const [ephemeralSource, setEphemeralSource] = React.useState<string>();

  const os = getAnnotation(vm?.spec?.template, ANNOTATIONS.os);

  const sourceOptions = React.useMemo(() => Object.values(getSourceOptions(t)), [t]);

  const onSelect = (event: React.ChangeEvent<HTMLSelectElement>, value: string) => {
    event.preventDefault();
    dispatch({ type: diskReducerActions.SET_DISK_SOURCE, payload: value });
    setIsOpen(false);
    // setDiskSource(value);
  };

  React.useEffect(() => {
    if (isCDROMType && [sourceTypes.BLANK, sourceTypes.EPHEMERAL].includes(diskSource)) {
      dispatch({ type: diskReducerActions.SET_DISK_SOURCE, payload: sourceTypes.HTTP });
    }
  }, [dispatch, isCDROMType, diskSource]);
  return (
    <>
      <FormGroup label={t('Source')} fieldId="disk-source" isRequired>
        <Select
          menuAppendTo="parent"
          isOpen={isOpen}
          onToggle={setIsOpen}
          onSelect={onSelect}
          variant={SelectVariant.single}
          selections={diskSource}
        >
          {sourceOptions.map(({ id, description, name }) => {
            const isDisabled =
              ((isVMRunning || isCDROMType) && id === sourceTypes.EPHEMERAL) ||
              (isCDROMType && id === sourceTypes.BLANK);
            return (
              <SelectOption isDisabled={isDisabled} key={id} value={id} description={description}>
                {name}
              </SelectOption>
            );
          })}
        </Select>
      </FormGroup>
      {diskSource === sourceTypes.HTTP && (
        <DiskSourceUrlInput
          url={urlSource}
          setURL={setURLSource}
          os={OS_NAME_TYPES[getOSNameWithoutVersionNumber(os)]}
        />
      )}
      {diskSource === sourceTypes.REGISTRY && (
        <DiskSourceContainer url={registerySource} setURL={setRegisterySource} os={os} />
      )}
      {diskSource === sourceTypes.EPHEMERAL && (
        <DiskSourceContainer url={ephemeralSource} setURL={setEphemeralSource} os={os} />
      )}
      {diskSource === sourceTypes.PVC && (
        <DiskSourcePVCSelect
          pvcNameSelected={pvcSourceName}
          // we allow to use only PVCs from the same namespace of the VM
          pvcNamespaceSelected={vm?.metadata?.namespace}
          selectPVCName={setPVCSourceName}
        />
      )}
      {diskSource === sourceTypes.CLONE_PVC && (
        <DiskSourcePVCSelect
          pvcNameSelected={pvcCloneSourceName}
          pvcNamespaceSelected={pvcCloneSourceNamespace}
          selectPVCName={setPVCCloneSourceName}
          selectNamespace={setPVCCloneSourceNamespace}
        />
      )}
    </>
  );
};

export default DiskSourceFormSelect;
