import React, { FC, useState } from 'react';

import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HyperConvergedModel } from '@kubevirt-utils/models';
import { CalculationMethod } from '@kubevirt-utils/resources/quotas/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, Radio } from '@patternfly/react-core';

import { calculationMethods } from '../constants';
import { CalculationMethodContentMapper } from '../types';

type EditCalculationMethodModalProps = {
  calculationMethodContentMapper: CalculationMethodContentMapper;
  hyperConverge: HyperConverged;
  initiallySelectedMethod: CalculationMethod;
  isOpen: boolean;
  onClose: () => void;
};

const EditCalculationMethodModal: FC<EditCalculationMethodModalProps> = ({
  calculationMethodContentMapper,
  hyperConverge,
  initiallySelectedMethod,
  isOpen,
  onClose,
}) => {
  const { t } = useKubevirtTranslation();

  const [checkedMethod, setCheckedMethod] = useState<CalculationMethod>(initiallySelectedMethod);

  const onSubmit = async () => {
    if (checkedMethod === initiallySelectedMethod) {
      return;
    }
    await k8sPatch<HyperConverged>({
      data: [
        {
          op: 'replace',
          path: '/spec/applicationAwareConfig/vmiCalcConfigName',
          value: checkedMethod,
        },
      ],
      model: HyperConvergedModel,
      resource: hyperConverge,
    });
  };

  return (
    <TabModal
      headerDescription={t(
        'The AAQ quota calculation method, or resource type, controls how AAQ calculates resource usage for quotas.',
      )}
      headerText={t('Edit quota calculation method')}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      shouldWrapInForm
    >
      <FormGroup fieldId="aaq-calculation-method" isStack role="radiogroup">
        {calculationMethods.map((method) => {
          const content = calculationMethodContentMapper[method];
          return (
            <Radio
              description={content.description}
              id={method}
              isChecked={method === checkedMethod}
              key={method}
              label={content.longLabel ?? content.label}
              name="aaq-calculation-method"
              onChange={() => setCheckedMethod(method)}
            />
          );
        })}
      </FormGroup>
    </TabModal>
  );
};

export default EditCalculationMethodModal;
