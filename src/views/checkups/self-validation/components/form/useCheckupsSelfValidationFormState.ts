import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TFunction } from 'i18next';

import { type IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getDefaultStorageClass } from '@kubevirt-utils/components/DiskModal/components/StorageClassAndPreallocation/utils/helpers';
import useRelatedImage from '@kubevirt-utils/hooks/useRelatedImage';
import useStorageProfileClaimPropertySets from '@kubevirt-utils/hooks/useStorageProfileClaimPropertySets';
import { modelToGroupVersionKind, StorageClassModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { generatePrettyName, isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { type SelectProps } from '@patternfly/react-core';

import { SELF_VALIDATION_NAME, selfValidationCheckupImageSettings, TEST_SUITES } from '../../utils';
import { calculatePVCStorageSize } from '../../utils/selfValidationJob/resourceTemplates';
import useIsOpenShiftPipelinesInstalled from '../hooks/useIsOpenShiftPipelinesInstalled';
import { type CheckupFormState } from './types';
import useStorageProfileCapabilitiesSync from './useStorageProfileCapabilitiesSync';
import useWindowsValidationFormState from './useWindowsValidationFormState';
import {
  addStorageCapability,
  addTestSuite,
  getTestSuitesToggleTitle,
  removeStorageCapability,
  removeTestSuite,
} from './utils';

const useCheckupsSelfValidationFormState = (translate: TFunction): CheckupFormState => {
  const cluster = useClusterParam();
  const [name, setName] = useState<string>(() => generatePrettyName(SELF_VALIDATION_NAME));
  const [checkupImage, checkupImageLoaded, checkupImageLoadError, checkupImageIsFallback] =
    useRelatedImage(selfValidationCheckupImageSettings);
  const [selectedTestSuites, setSelectedTestSuites] = useState<string[]>(TEST_SUITES);
  const [isDryRun, setIsDryRun] = useState<boolean>(false);
  const [storageClass, setStorageClass] = useState<string>('');
  const [testSkips, setTestSkips] = useState<string>('');
  const [storageCapabilities, setStorageCapabilities] = useState<string[]>([]);

  const windowsState = useWindowsValidationFormState(selectedTestSuites);
  const [pipelinesInstalled, pipelinesLoaded] = useIsOpenShiftPipelinesInstalled();

  const defaultPvcSize = useMemo(
    () => calculatePVCStorageSize(selectedTestSuites),
    [selectedTestSuites],
  );
  const [pvcSize, setPvcSize] = useState<string>(defaultPvcSize);

  useEffect(() => {
    setPvcSize(defaultPvcSize);
  }, [defaultPvcSize]);

  const [storageClasses, storageClassesLoaded] = useK8sWatchData<IoK8sApiStorageV1StorageClass[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(StorageClassModel),
    isList: true,
  });

  const defaultSC = useMemo(() => getDefaultStorageClass(storageClasses), [storageClasses]);
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const effectiveStorageClass = storageClass || getName(defaultSC) || '';

  const storageProfile = useStorageProfileClaimPropertySets(effectiveStorageClass, cluster);
  const { claimPropertySets } = storageProfile;
  const storageProfileError = storageProfile.error as Error | undefined;
  const storageProfileLoaded = storageProfile.loaded;

  useStorageProfileCapabilitiesSync(
    effectiveStorageClass,
    claimPropertySets,
    storageProfileLoaded,
    setStorageCapabilities,
  );

  useEffect(() => {
    if (!storageClass && storageClassesLoaded && !isEmpty(defaultSC)) {
      setStorageClass(getName(defaultSC));
    }
  }, [defaultSC, storageClass, storageClassesLoaded]);

  const handleStorageCapabilitySelect: SelectProps['onSelect'] = useCallback(
    (_event, value: string) => {
      setStorageCapabilities((prev) =>
        prev.includes(value)
          ? removeStorageCapability(prev, value)
          : addStorageCapability(prev, value),
      );
    },
    [],
  );

  const handleTestSuiteSelect: SelectProps['onSelect'] = useCallback((_event, value: string) => {
    setSelectedTestSuites((prev) =>
      prev.includes(value) ? removeTestSuite(prev, value) : addTestSuite(prev, value),
    );
  }, []);

  const testSuitesToggleTitle = useMemo(
    () => getTestSuitesToggleTitle(selectedTestSuites, translate),
    [selectedTestSuites, translate],
  );

  return {
    checkupImage,
    checkupImageIsFallback,
    checkupImageLoaded,
    checkupImageLoadError,
    claimPropertySets,
    effectiveStorageClass,
    handleStorageCapabilitySelect,
    handleTestSuiteSelect,
    isDryRun,
    name,
    pipelinesInstalled,
    pipelinesLoaded,
    pvcSize,
    selectedTestSuites,
    setIsDryRun,
    setName,
    setPvcSize,
    setStorageClass,
    setTestSkips,
    storageCapabilities,
    storageClasses,
    storageClassesLoaded,
    storageProfileError: Boolean(storageProfileError),
    storageProfileLoaded,
    testSkips,
    testSuitesToggleTitle,
    windowsState,
  };
};

export default useCheckupsSelfValidationFormState;
