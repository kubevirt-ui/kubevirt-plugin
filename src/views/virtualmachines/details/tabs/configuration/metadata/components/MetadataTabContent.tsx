import React, { FC } from 'react';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import useMetadataTabState from '../hooks/useMetadataTabState';

import AdvancedView from './AdvancedView';
import AnnotationsTable from './AnnotationsTable';
import LabelsAnnotationsHeader from './LabelsAnnotationsHeader';
import LabelsTable from './LabelsTable';

type MetadataTabContentProps = {
  onAnnotationsSubmit: (annotations: Record<string, string>) => Promise<K8sResourceCommon | void>;
  onLabelsSubmit: (labels: Record<string, string>) => Promise<K8sResourceCommon | void>;
  vm: K8sResourceCommon;
};

const MetadataTabContent: FC<MetadataTabContentProps> = ({
  onAnnotationsSubmit,
  onLabelsSubmit,
  vm,
}) => {
  const { isAdvancedView, setIsAdvancedView } = useMetadataTabState();

  return (
    <>
      <LabelsAnnotationsHeader
        isAdvancedView={isAdvancedView}
        toggleAdvancedView={setIsAdvancedView}
      />
      {isAdvancedView ? (
        <AdvancedView
          model={VirtualMachineModel}
          onAnnotationsSubmit={onAnnotationsSubmit}
          onLabelsSubmit={onLabelsSubmit}
          resource={vm}
        />
      ) : (
        <>
          <LabelsTable onLabelsSubmit={onLabelsSubmit} resource={vm} />
          <AnnotationsTable onAnnotationsSubmit={onAnnotationsSubmit} resource={vm} />
        </>
      )}
    </>
  );
};

export default MetadataTabContent;
