import * as React from 'react';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import NodeCheckerAlert from '@kubevirt-utils/components/NodeSelectorModal/components/NodeCheckerAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Divider, Form, Text, TextVariants } from '@patternfly/react-core';

import { isTermsInvalid } from '../../../utils/helpers';
import {
  AffinityCondition,
  AffinityLabel,
  AffinityRowData,
  AffinityType,
} from '../../../utils/types';

import AffinityConditionSelect from './components/AffinityConditionSelect';
import AffinityTypeSelect from './components/AffinityTypeSelect';
import ExpressionEditList from './components/ExpressionEditList';
import FieldsEditList from './components/FieldsEditList';
import NodeExpressionDescriptionText from './components/NodeExpressionDescriptionText';
import NodeFieldsDescriptionText from './components/NodeFieldsDescriptionText';
import PrefferedAffinityWeightInput from './components/PrefferedAffinityWeightInput';
import TopologyKeyInput from './components/TopologyKeyInput';
import WorkloadExpressionDescriptionText from './components/WorkloadExpressionDescriptionText';

export type useIDEntitiesValue = {
  entities: AffinityLabel[];
  setEntities: React.Dispatch<React.SetStateAction<AffinityLabel[]>>;
  onEntityAdd: (newEntity: AffinityLabel) => void;
  onEntityChange: (updatedEntity: AffinityLabel) => void;
  onEntityDelete: (idToDelete: number) => void;
  initialEntitiesChanged: boolean;
};

type AffinityFormProps = {
  focusedAffinity: AffinityRowData;
  setFocusedAffinity: React.Dispatch<React.SetStateAction<AffinityRowData>>;
  setSubmitDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  expressions: useIDEntitiesValue;
  fields: useIDEntitiesValue;
  qualifiedNodes: IoK8sApiCoreV1Node[];
  nodesLoaded: boolean;
  isSubmitDisabled: boolean;
};

const AffinityForm: React.FC<AffinityFormProps> = ({
  focusedAffinity,
  setFocusedAffinity,
  setSubmitDisabled,
  expressions,
  fields,
  qualifiedNodes,
  nodesLoaded,
  isSubmitDisabled,
}) => {
  const { t } = useKubevirtTranslation();

  const isNodeAffinity = focusedAffinity?.type === AffinityType.node;

  React.useEffect(() => {
    setSubmitDisabled(
      (expressions?.entities?.length === 0 && fields?.entities?.length === 0) ||
        isTermsInvalid(expressions?.entities) ||
        isTermsInvalid(fields?.entities),
    );
  }, [expressions, fields, setSubmitDisabled]);

  return (
    <Form>
      <Text className="text-muted" component={TextVariants.p}>
        {t(
          'Define an affinity rule. This rule will be added to the list of affinity rules applied to this workload.',
        )}
      </Text>
      <AffinityTypeSelect
        focusedAffinity={focusedAffinity}
        setFocusedAffinity={setFocusedAffinity}
      />
      <AffinityConditionSelect
        focusedAffinity={focusedAffinity}
        setFocusedAffinity={setFocusedAffinity}
      />
      {focusedAffinity?.condition === AffinityCondition.preferred && (
        <PrefferedAffinityWeightInput
          focusedAffinity={focusedAffinity}
          setFocusedAffinity={setFocusedAffinity}
          setSubmitDisabled={setSubmitDisabled}
        />
      )}
      {!isNodeAffinity && (
        <TopologyKeyInput
          focusedAffinity={focusedAffinity}
          setFocusedAffinity={setFocusedAffinity}
          setSubmitDisabled={setSubmitDisabled}
        />
      )}
      <Divider />
      <ExpressionEditList
        expressions={expressions}
        label={isNodeAffinity ? t('Node labels') : t('Workload labels')}
        helperText={
          isNodeAffinity ? <NodeExpressionDescriptionText /> : <WorkloadExpressionDescriptionText />
        }
        errorHelperText={t('Missing fields in {{kind}} labels', {
          kind: isNodeAffinity ? 'Node' : 'Workload',
        })}
      />
      {isNodeAffinity && (
        <>
          <Divider />
          <FieldsEditList
            fields={fields}
            label={t('Node fields')}
            helperText={<NodeFieldsDescriptionText />}
            errorHelperText={t('Missing fields in Node fields')}
          />
        </>
      )}
      {isNodeAffinity && nodesLoaded && !isSubmitDisabled && (
        <NodeCheckerAlert qualifiedNodes={qualifiedNodes} nodesLoaded={nodesLoaded} />
      )}
    </Form>
  );
};
export default AffinityForm;
