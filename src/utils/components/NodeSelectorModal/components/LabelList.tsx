import * as React from 'react';
import { FC, ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Grid, Split, SplitItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon, PlusCircleIcon } from '@patternfly/react-icons';

type LabelsListProps = {
  addRowText?: string;
  children: ReactNode;
  emptyStateAddRowText?: string;
  isEmpty: boolean;
  model?: K8sModel;
  onLabelAdd: () => void;
};

const LabelsList: FC<LabelsListProps> = ({
  addRowText = null,
  children,
  emptyStateAddRowText = null,
  isEmpty,
  model,
  onLabelAdd,
}) => {
  const { t } = useKubevirtTranslation();
  const addRowTxt = addRowText || t('Add Label');
  const emptyStateAddRowTxt = emptyStateAddRowText || t('Add Label to specify qualifying nodes');
  return (
    <>
      <Grid hasGutter>{children}</Grid>
      <Split>
        <SplitItem>
          <Button
            className="pf-m-link--align-left"
            icon={<PlusCircleIcon />}
            id="vm-labels-list-add-btn"
            onClick={() => onLabelAdd()}
            variant="link"
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
              variant="link"
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
