import React, { FC, useEffect, useState } from 'react';

import SelectInstanceTypeSection from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/SelectInstanceTypeSection';
import VMDetailsSection from '@catalog/CreateFromInstanceTypes/components/VMDetailsSection/VMDetailsSection';
import { CREATE_VM_TAB } from '@catalog/CreateVMHorizontalNav/constants';
import GuidedTour from '@kubevirt-utils/components/GuidedTour/GuidedTour';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import useBootableVolumes from '@kubevirt-utils/resources/bootableresources/hooks/useBootableVolumes';
import useUserDefaultNamespace from '@kubevirt-utils/resources/namespaces/hooks/useUserDefaultNamespace';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Card, Divider, Grid, GridItem, List } from '@patternfly/react-core';

import AddBootableVolumeButton from './components/AddBootableVolumeButton/AddBootableVolumeButton';
import BootableVolumeList from './components/BootableVolumeList/BootableVolumeList';
import CreateFromInstanceTypeTitle from './components/CreateFromInstanceTypeTitle/CreateFromInstanceTypeTitle';
import CreateVMFooter from './components/CreateVMFooter/CreateVMFooter';
import SectionListItem from './components/SectionListItem/SectionListItem';
import useInstanceTypesAndPreferences from './state/hooks/useInstanceTypesAndPreferences';
import { useInstanceTypeVMStore } from './state/useInstanceTypeVMStore';
import { INSTANCE_TYPES_SECTIONS } from './utils/constants';

import './CreateFromInstanceType.scss';

type CreateFromInstanceTypeProps = { currentTab: CREATE_VM_TAB };

const CreateFromInstanceType: FC<CreateFromInstanceTypeProps> = ({ currentTab }) => {
  const { t } = useKubevirtTranslation();
  const sectionState = useState<INSTANCE_TYPES_SECTIONS>(INSTANCE_TYPES_SECTIONS.SELECT_VOLUME);

  const [userDefaultNamespace, namespacesLoaded] = useUserDefaultNamespace();
  const { resetInstanceTypeVMState, setVMNamespaceTarget, volumeListNamespace } =
    useInstanceTypeVMStore();
  const bootableVolumesData = useBootableVolumes(volumeListNamespace);
  const instanceTypesAndPreferencesData = useInstanceTypesAndPreferences();
  const [activeNamespace] = useActiveNamespace();
  const [authorizedSSHKeys, , loaded] = useKubevirtUserSettings('ssh');

  useEffect(() => {
    resetInstanceTypeVMState();
  }, [resetInstanceTypeVMState]);

  useEffect(() => {
    if (!namespacesLoaded || isEmpty(userDefaultNamespace)) return;

    const targetNS =
      activeNamespace === ALL_NAMESPACES_SESSION_KEY ? userDefaultNamespace : activeNamespace;
    setVMNamespaceTarget(authorizedSSHKeys?.[targetNS], targetNS);
  }, [
    activeNamespace,
    authorizedSSHKeys,
    setVMNamespaceTarget,
    namespacesLoaded,
    userDefaultNamespace,
  ]);

  const [favorites = [], updaterFavorites, loadedFavorites] =
    useKubevirtUserSettings('favoriteBootableVolumes');

  if (
    !bootableVolumesData?.loaded ||
    !instanceTypesAndPreferencesData?.loaded ||
    !loaded ||
    (!loadedFavorites && !favorites)
  ) {
    return (
      <Bullseye className="create-vm-instance-type-section__page-loader">
        <Loading />
      </Bullseye>
    );
  }

  return (
    <>
      <GuidedTour />
      <Grid className="co-dashboard-body">
        <GridItem>
          <Card>
            <List className="create-vm-instance-type-section__list" isPlain>
              <SectionListItem
                headerAction={
                  <AddBootableVolumeButton loadError={instanceTypesAndPreferencesData.loadError} />
                }
                headerText={
                  <CreateFromInstanceTypeTitle
                    instanceTypesAndPreferencesData={instanceTypesAndPreferencesData}
                  />
                }
                sectionKey={INSTANCE_TYPES_SECTIONS.SELECT_VOLUME}
                sectionState={sectionState}
              >
                <BootableVolumeList
                  bootableVolumesData={bootableVolumesData}
                  currentTab={currentTab}
                  displayShowAllButton
                  favorites={[favorites as [], updaterFavorites]}
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
      <CreateVMFooter />
    </>
  );
};

export default CreateFromInstanceType;
