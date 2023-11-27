import React, { FC, useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import { getOSImagesNS } from 'src/views/clusteroverview/OverviewTab/inventory-card/utils/utils';

import SelectInstanceTypeSection from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/SelectInstanceTypeSection';
import VMDetailsSection from '@catalog/CreateFromInstanceTypes/components/VMDetailsSection/VMDetailsSection';
import EnableInstanceTypeTechPreviewModal from '@catalog/EnableInstanceTypeTechPreviewModal/EnableInstanceTypeTechPreviewModal';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import useBootableVolumes from '@kubevirt-utils/resources/bootableresources/hooks/useBootableVolumes';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import {
  Bullseye,
  Card,
  Divider,
  Grid,
  GridItem,
  List,
  PopoverPosition,
} from '@patternfly/react-core';

import AddBootableVolumeButton from './components/AddBootableVolumeButton/AddBootableVolumeButton';
import BootableVolumeList from './components/BootableVolumeList/BootableVolumeList';
import CreateVMFooter from './components/CreateVMFooter/CreateVMFooter';
import SectionListItem from './components/SectionListItem/SectionListItem';
import useEnableInstanceTypeModal from './hooks/useEnableInstanceTypeModal';
import useInstanceTypesAndPreferences from './state/hooks/useInstanceTypesAndPreferences';
import { useInstanceTypeVMStore } from './state/useInstanceTypeVMStore';
import { INSTANCE_TYPES_SECTIONS } from './utils/constants';

import './CreateFromInstanceType.scss';

type CreateFromInstanceTypeProps = {
  isInstanceTypeTab: boolean;
  navigateToCatalog: () => void;
};

const CreateFromInstanceType: FC<CreateFromInstanceTypeProps> = ({
  isInstanceTypeTab,
  navigateToCatalog,
}) => {
  const { t } = useKubevirtTranslation();
  const sectionState = useState<INSTANCE_TYPES_SECTIONS>(INSTANCE_TYPES_SECTIONS.SELECT_VOLUME);

  const bootableVolumesData = useBootableVolumes(getOSImagesNS());
  const instanceTypesAndPreferencesData = useInstanceTypesAndPreferences();
  const [activeNamespace] = useActiveNamespace();
  const [authourizedSSHKeys, , loaded] = useKubevirtUserSettings('ssh');

  const { resetInstanceTypeVMState, setVMNamespaceTarget } = useInstanceTypeVMStore();

  const { loading, ...enableITModalProps } = useEnableInstanceTypeModal(
    isInstanceTypeTab,
    navigateToCatalog,
  );

  useEffect(() => {
    resetInstanceTypeVMState();
  }, [resetInstanceTypeVMState]);

  useEffect(() => {
    const targetNS =
      activeNamespace === ALL_NAMESPACES_SESSION_KEY ? DEFAULT_NAMESPACE : activeNamespace;
    setVMNamespaceTarget(authourizedSSHKeys?.[targetNS], targetNS);
  }, [activeNamespace, authourizedSSHKeys, setVMNamespaceTarget]);

  if (
    loading ||
    !bootableVolumesData?.loaded ||
    !instanceTypesAndPreferencesData?.loaded ||
    !loaded
  ) {
    return (
      <Bullseye className="create-vm-instance-type-section__page-loader">
        <Loading />
      </Bullseye>
    );
  }

  return (
    <>
      <Grid className="co-dashboard-body">
        <GridItem>
          <Card>
            <List className="create-vm-instance-type-section__list" isPlain>
              <SectionListItem
                headerAction={
                  <AddBootableVolumeButton loadError={instanceTypesAndPreferencesData.loadError} />
                }
                headerText={
                  <>
                    {t('Select volume to boot from')}{' '}
                    <HelpTextIcon
                      bodyContent={
                        <>
                          <Trans ns="plugin__kubevirt-plugin" t={t}>
                            The Volume table displays DataSources and PersistentVolumeClaims that
                            VirtualMachines can boot from.
                            <div>
                              Click <b> Add volume</b> to boot from a volume that is not listed.
                            </div>
                          </Trans>
                        </>
                      }
                      className="create-vm-instance-type-section__HelpTextIcon"
                      position={PopoverPosition.right}
                    />
                  </>
                }
                sectionKey={INSTANCE_TYPES_SECTIONS.SELECT_VOLUME}
                sectionState={sectionState}
              >
                <BootableVolumeList
                  bootableVolumesData={bootableVolumesData}
                  displayShowAllButton
                  preferencesData={instanceTypesAndPreferencesData.preferences}
                />
              </SectionListItem>

              <Divider className="create-vm-instance-type-section__divider" />

              <SectionListItem
                headerText={t('Select InstanceType')}
                sectionKey={INSTANCE_TYPES_SECTIONS.SELECT_INSTANCE_TYPE}
                sectionState={sectionState}
              >
                <SelectInstanceTypeSection
                  instanceTypesAndPreferencesData={instanceTypesAndPreferencesData}
                />
              </SectionListItem>

              <Divider className="create-vm-instance-type-section__divider" />

              <SectionListItem
                headerText={t('VirtualMachine details')}
                sectionKey={INSTANCE_TYPES_SECTIONS.VM_DETAILS}
                sectionState={sectionState}
              >
                <VMDetailsSection
                  instanceTypesAndPreferencesData={instanceTypesAndPreferencesData}
                />
              </SectionListItem>
            </List>
          </Card>
        </GridItem>
      </Grid>
      <CreateVMFooter isDisabled={enableITModalProps?.isOpen} />
      <EnableInstanceTypeTechPreviewModal {...enableITModalProps} />
    </>
  );
};

export default CreateFromInstanceType;
