import { type V1MigrationConfiguration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { getLiveMigrationConfig } from '@kubevirt-utils/resources/hyperconverged/selectors';

export type UseHyperConvergedMigrationsResult = {
  error: Error | undefined;
  loaded: boolean;
  migrations: V1MigrationConfiguration | undefined;
};

const useHyperConvergedMigrations = (): UseHyperConvergedMigrationsResult => {
  const [hyperConverge, loaded, error] = useHyperConvergeConfiguration();

  return {
    error,
    loaded,
    migrations: getLiveMigrationConfig(hyperConverge),
  };
};

export default useHyperConvergedMigrations;
