import * as React from 'react';
import { FC, ReactNode } from 'react';
import classNames from 'classnames';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Grid, GridItem, Split, SplitItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon, PlusCircleIcon } from '@patternfly/react-icons';

type LabelsListProps = {
  addRowText?: string;
  children: ReactNode;
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
    <>
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
      <Split>
        <SplitItem>
          <Button
            className={classNames('pf-m-link--align-left', { 'pf-v6-u-mt-md': !isEmpty })}
            icon={<PlusCircleIcon />}
            id="vm-labels-list-add-btn"
            onClick={() => onLabelAdd()}
            variant={ButtonVariant.link}
          >
            {isEmpty ? emptyStateAddRowTxt : addRowTxt}
          </Button>
        </SplitItem>
        <SplitItem isFilled />
        <SplitItem>
          {model && (
            <Button
              className="pf-m-link--align-right"
              component="a"
              href={`/k8s/cluster/${model.plural}`}
              icon={<ExternalLinkAltIcon />}
              iconPosition="right"
              id="explore-nodes-btn"
              target="_blank"
              variant={ButtonVariant.link}
            >
              {t('Explore {{kind}} list', { kind: model.kind })}
            </Button>
          )}
        </SplitItem>
      </Split>
    </>
  );
};

export default LabelsList;
