import { type V1MigrationConfiguration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { getLiveMigrationConfig } from '@kubevirt-utils/resources/hyperconverged/selectors';

const useHyperConvergedMigrations = (): V1MigrationConfiguration => {
  const [hyperConverge] = useHyperConvergeConfiguration();
  return getLiveMigrationConfig(hyperConverge) ?? {};
};

export default useHyperConvergedMigrations;
