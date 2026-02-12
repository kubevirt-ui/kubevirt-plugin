import React, { FC } from 'react';

import ExpandableProjectList from '@kubevirt-utils/components/ExpandableProjectList/ExpandableProjectList';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';

import useVMNetworkMatchedProjects from '../../hooks/useVMNetworkMatchedProjects';

type MatchedProjectsProps = {
  obj: ClusterUserDefinedNetworkKind;
};

const MatchedProjects: FC<MatchedProjectsProps> = ({ obj }) => {
  const { t } = useKubevirtTranslation();
  const [matchingProjects, loaded] = useVMNetworkMatchedProjects(obj);

  return (
    <ExpandableProjectList
      emptyMessage={t('No projects matched')}
      loaded={loaded}
      projectNames={matchingProjects.map(getName)}
    />
  );
};

export default MatchedProjects;
