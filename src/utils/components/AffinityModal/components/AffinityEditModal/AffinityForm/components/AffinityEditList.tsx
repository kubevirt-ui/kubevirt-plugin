import * as React from 'react';

import LabelsList from '@kubevirt-utils/components/NodeSelectorModal/components/LabelList';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants, GridItem } from '@patternfly/react-core';

import { AffinityLabel } from '../../../../utils/types';

import AffinityEditRow from './AffinityEditRow';

type AffinityExpressionListProps = {
  addRowText: string;
  expressions: AffinityLabel[];
  onAdd: () => void;
  onChange: (aff: AffinityLabel) => void;
  onDelete: (id: any) => void;
  rowID: string;
};

const AffinityEditList: React.FC<AffinityExpressionListProps> = ({
  addRowText,
  expressions,
  onAdd,
  onChange,
  onDelete,
  rowID,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <LabelsList
      addRowText={addRowText}
      emptyStateAddRowText={addRowText}
      isEmpty={expressions?.length === 0}
      onLabelAdd={onAdd}
    >
      {expressions.length > 0 && (
        <>
          <GridItem span={4}>
            <Content component={ContentVariants.h6}>{t('Key')}</Content>
          </GridItem>
          <GridItem span={2}>
            <Content component={ContentVariants.h6}>{t('Operator')}</Content>
          </GridItem>
          <GridItem span={6}>
            <Content component={ContentVariants.h6}>{t('Values')}</Content>
          </GridItem>
          {expressions.map((expression) => (
            <AffinityEditRow
              expression={expression}
              key={expression.id}
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
