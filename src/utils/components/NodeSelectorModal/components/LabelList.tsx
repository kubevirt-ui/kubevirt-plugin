import React, { FC, ReactNode } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Flex, Grid, GridItem, Stack } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

type LabelsListProps = {
  addRowText?: string;
  children?: ReactNode;
  emptyStateAddRowText?: string;
  isEmpty: boolean;
  model?: K8sModel;
  onLabelAdd: () => void;
  withKeyValueTitle?: boolean;
};

const LabelsList: FC<LabelsListProps> = ({
  addRowText = null,
  children,
  emptyStateAddRowText = null,
  isEmpty,
  model,
  onLabelAdd,
  withKeyValueTitle,
}) => {
  const { t } = useKubevirtTranslation();
  const addRowTxt = addRowText || t('Add label');
  const emptyStateAddRowTxt = emptyStateAddRowText || t('Add label to specify qualifying nodes');

  return (
    <Stack hasGutter={!isEmpty}>
      <Grid hasGutter>
        {withKeyValueTitle && !isEmpty && (
          <>
            <GridItem span={6}>
              <div className="pf-v6-u-font-weight-bold">{t('Key')}</div>
            </GridItem>
            <GridItem span={5}>
              <div className="pf-v6-u-font-weight-bold">{t('Value')}</div>
            </GridItem>
          </>
        )}
        {children}
      </Grid>
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
      >
        <Button
          className="pf-m-link--align-left"
          icon={<PlusCircleIcon />}
          id="vm-labels-list-add-btn"
          onClick={() => onLabelAdd()}
          variant={ButtonVariant.link}
        >
          {isEmpty ? emptyStateAddRowTxt : addRowTxt}
        </Button>
        {model && (
          <ExternalLink
            dataTestID="explore-nodes-btn"
            href={`/k8s/cluster/${model.plural}`}
            text={t('Explore {{kind}} list', { kind: model.kind })}
          />
        )}
      </Flex>
    </Stack>
  );
};

export default LabelsList;
