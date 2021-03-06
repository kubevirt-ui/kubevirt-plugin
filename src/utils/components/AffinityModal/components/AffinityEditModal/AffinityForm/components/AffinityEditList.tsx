import * as React from 'react';

import LabelsList from '@kubevirt-utils/components/NodeSelectorModal/components/LabelList';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { GridItem, Text, TextVariants } from '@patternfly/react-core';

import { AffinityLabel } from '../../../../utils/types';

import AffinityEditRow from './AffinityEditRow';

type AffinityExpressionListProps = {
  expressions: AffinityLabel[];
  addRowText: string;
  onAdd: () => void;
  onChange: (aff: AffinityLabel) => void;
  onDelete: (id: any) => void;
  rowID: string;
};

const AffinityEditList: React.FC<AffinityExpressionListProps> = ({
  expressions,
  addRowText,
  onAdd,
  onChange,
  onDelete,
  rowID,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <LabelsList
      isEmpty={expressions?.length === 0}
      onLabelAdd={onAdd}
      addRowText={addRowText}
      emptyStateAddRowText={addRowText}
    >
      {expressions.length > 0 && (
        <>
          <GridItem span={4}>
            <Text component={TextVariants.h6}>{t('Key')}</Text>
          </GridItem>
          <GridItem span={2}>
            <Text component={TextVariants.h6}>{t('Operator')}</Text>
          </GridItem>
          <GridItem span={6}>
            <Text component={TextVariants.h6}>{t('Values')}</Text>
          </GridItem>
          {expressions.map((expression) => (
            <AffinityEditRow
              key={expression.id}
              expression={expression}
              onChange={onChange}
              onDelete={onDelete}
              rowID={rowID}
            />
          ))}
        </>
      )}
    </LabelsList>
  );
};

export default AffinityEditList;
