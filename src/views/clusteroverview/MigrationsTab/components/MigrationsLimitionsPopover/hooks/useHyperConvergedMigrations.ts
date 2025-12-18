import { V1MigrationConfiguration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';

const useHyperConvergedMigrations = (): V1MigrationConfiguration => {
  const [hyperConverge] = useHyperConvergeConfiguration();
  return hyperConverge?.spec?.liveMigrationConfig || {};
};

export default useHyperConvergedMigrations;
