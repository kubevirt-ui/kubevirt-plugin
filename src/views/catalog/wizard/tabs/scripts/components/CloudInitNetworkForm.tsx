import React from 'react';
import { dump, load } from 'js-yaml';
import { useImmer } from 'use-immer';

import { ensurePath, produceVMDisks, UpdateValidatedVM } from '@catalog/utils/WizardVMContext';
import { V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { Checkbox, Divider, FormGroup, TextInput } from '@patternfly/react-core';

import { CloudInitDataHelper, CloudInitNetworkFormKeys } from '../utils/cloud-init-data-helper';

type CloudInitNetwork = {
  network: {
    version: string;
    config: {
      type: string;
      name: string;
      mac_address?: string;
      subnets: { type: string; address: string[]; gateway: string }[];
    }[];
  };
};

type CloudinitNetworkFormProps = {
  cloudInitVolume: V1Volume;
  updateVM: UpdateValidatedVM;
};

const initialNetwork: CloudInitNetwork = {
  network: {
    version: '1',
    config: [
      {
        type: 'physical',
        name: '',
        subnets: [
          {
            type: 'static',
            address: [''],
            gateway: '',
          },
        ],
      },
    ],
  },
};

export const CloudinitNetworkForm: React.FC<CloudinitNetworkFormProps> = ({
  cloudInitVolume,
  updateVM,
}) => {
  const { t } = useKubevirtTranslation();
  const cloudInitData = cloudInitVolume?.cloudInitNoCloud || cloudInitVolume?.cloudInitConfigDrive;

  const [cloudinitConfigNetworkData, isBase64] = React.useMemo(
    () => CloudInitDataHelper.getNetworkData(cloudInitData || {}),
    [cloudInitData],
  );

  const templateHasNetworkData = typeof load(cloudinitConfigNetworkData) === 'object';
  const [showForm, setShowForm] = React.useState(templateHasNetworkData);
  const [networkData, setNetworkData] = useImmer<CloudInitNetwork>(
    templateHasNetworkData
      ? (load(cloudinitConfigNetworkData) as CloudInitNetwork)
      : initialNetwork,
  );
  const networkToEdit = networkData?.network?.config?.[0];

  const onFieldChange = (field: string, value: string | string[]) => {
    setNetworkData((draft) => {
      ensurePath(draft, 'network.config');
      const draftNetworkToEdit = draft?.network?.config?.[0];

      if (!draftNetworkToEdit) {
        draft.network.config = [];
      }

      if (field === CloudInitNetworkFormKeys.NAME) {
        draftNetworkToEdit.name = value as string;
      } else {
        if (!draftNetworkToEdit.subnets?.[0]) {
          draftNetworkToEdit.subnets = [{ type: 'static', address: [''], gateway: '' }];
        }
        draftNetworkToEdit.subnets[0][field] = value as string;
      }
    });
  };

  const onUpdateVM = React.useCallback(
    () =>
      updateVM((vmToUpdate) =>
        produceVMDisks(vmToUpdate, (vmDraft) => {
          const cloudInitDiskName = cloudInitVolume?.name || 'cloudinitdisk';
          const cloudInitDisk = vmDraft.spec.template.spec.domain.devices.disks.find(
            (disk) => disk.name === cloudInitDiskName,
          );

          // cloudinitdisk deleted or doesn't exist, we need to re-create it
          if (!cloudInitDisk) {
            vmDraft.spec.template.spec.domain.devices.disks.push({
              name: cloudInitDiskName,
              disk: {
                bus: 'virtio',
              },
            });
          }

          const updatedCloudinitVolume = {
            name: cloudInitDiskName,
            cloudInitNoCloud: {
              ...(cloudInitData || {}),
              ...CloudInitDataHelper.toCloudInitNoCloudNetworkSource(dump(networkData), isBase64),
            },
          };

          const otherVolumes = getVolumes(vmDraft).filter((vol) => !vol.cloudInitNoCloud);
          vmDraft.spec.template.spec.volumes = [...otherVolumes, updatedCloudinitVolume];
        }),
      ),
    [updateVM, cloudInitVolume?.name, cloudInitData, networkData, isBase64],
  );

  React.useEffect(() => {
    if (networkData) {
      const ipAddreses = networkToEdit.subnets[0].address.join(', ');
      const hasChanged =
        ipAddreses !== '' || networkToEdit.subnets[0].gateway !== '' || networkToEdit.name !== '';

      const timerId = setTimeout(() => hasChanged && onUpdateVM(), 100);

      return () => clearTimeout(timerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkData, showForm]);

  // delete networkData if user unchecks the checkbox
  React.useEffect(() => {
    if (!showForm && templateHasNetworkData) {
      updateVM((draft) => {
        const cloudVolume = getVolumes(draft).find((vol) => vol.cloudInitNoCloud);
        if (cloudVolume?.cloudInitNoCloud?.networkData) {
          delete cloudVolume.cloudInitNoCloud.networkData;
          const otherVolumes = getVolumes(draft).filter((vol) => !vol.cloudInitNoCloud);
          draft.spec.template.spec.volumes = [...otherVolumes, cloudVolume];
        }
      });
    }
  }, [setNetworkData, showForm, templateHasNetworkData, updateVM]);

  return (
    <>
      <FormGroup fieldId="divider">
        <Divider />
      </FormGroup>

      <FormGroup fieldId="custom-network-checkbox">
        <Checkbox
          id="custom-network-checkbox"
          label={t('Add network data')}
          description={t('check this option to add network data section to the cloud-init script.')}
          isChecked={showForm}
          onChange={setShowForm}
        />
      </FormGroup>
      {showForm && (
        <>
          <FormGroup
            label={t('Ethernet name')}
            fieldId={'ethernet-name'}
            className="kv-cloudint-advanced-tab--validation-text"
          >
            <TextInput
              value={networkToEdit?.name || ''}
              type="text"
              id={'ethernet-name'}
              onChange={(v) => onFieldChange(CloudInitNetworkFormKeys.NAME, v)}
            />
          </FormGroup>
          <FormGroup
            label={t('IP Addresses')}
            fieldId={'address'}
            className="kv-cloudint-advanced-tab--validation-text"
            helperText={t('Use commas to separate between IP addresses')}
          >
            <TextInput
              value={networkToEdit?.subnets?.[0]?.address.join(', ') || ''}
              type="text"
              id={'address'}
              onChange={(v) => onFieldChange(CloudInitNetworkFormKeys.ADDRESS, v.split(', '))}
            />
          </FormGroup>
          <FormGroup
            label={t('Gateway address')}
            fieldId={'gateway'}
            className="kv-cloudint-advanced-tab--validation-text"
          >
            <TextInput
              value={(networkToEdit?.subnets?.[0]?.gateway as string) || ''}
              type="text"
              id={'gateway'}
              onChange={(v) => onFieldChange(CloudInitNetworkFormKeys.GATEWAY, v)}
            />
          </FormGroup>
        </>
      )}
      <FormGroup fieldId="divider">
        <Divider />
      </FormGroup>
    </>
  );
};
