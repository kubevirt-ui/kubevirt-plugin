import { useMemo } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  isNavSection,
  SetFeatureFlag,
  useResolvedExtensions,
} from '@openshift-console/dynamic-plugin-sdk';

import { FLAG_SHOW_MIGRATION_SECTION, KUBEVIRT_PLUGIN_NAME, MIGRATION_SECTION_ID } from './consts';

const useShowMigrationSectionFlag = (setFeatureFlag: SetFeatureFlag) => {
  const [navSectionExtensions, navSectionResolved] = useResolvedExtensions(isNavSection);

  const noMigrationSectionExtension = useMemo(
    () =>
      isEmpty(
        navSectionExtensions?.find(
          (extension) =>
            extension.properties.id === MIGRATION_SECTION_ID &&
            extension.pluginName !== KUBEVIRT_PLUGIN_NAME,
        ),
      ),
    [navSectionExtensions],
  );

  if (navSectionResolved) {
    setFeatureFlag(FLAG_SHOW_MIGRATION_SECTION, noMigrationSectionExtension);
  }
};

export default useShowMigrationSectionFlag;
