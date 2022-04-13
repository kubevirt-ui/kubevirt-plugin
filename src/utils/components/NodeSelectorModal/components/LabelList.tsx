import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Grid, Split, SplitItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon, PlusCircleIcon } from '@patternfly/react-icons';

type LabelsListProps = {
  children: React.ReactNode;
  isEmpty: boolean;
  model?: K8sModel;
  addRowText?: string;
  emptyStateAddRowText?: string;
  onLabelAdd: () => void;
};

const LabelsList: React.FC<LabelsListProps> = ({
  isEmpty,
  onLabelAdd,
  model,
  children,
  addRowText = null,
  emptyStateAddRowText = null,
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
            id="vm-labels-list-add-btn"
            variant="link"
            onClick={() => onLabelAdd()}
            icon={<PlusCircleIcon />}
          >
            {isEmpty ? emptyStateAddRowTxt : addRowTxt}
          </Button>
        </SplitItem>
        <SplitItem isFilled />
        <SplitItem>
          {model && (
            <Button
              component="a"
              href={`/k8s/cluster/${model.plural}`}
              target="_blank"
              className="pf-m-link--align-right"
              id="explore-nodes-btn"
              variant="link"
              icon={<ExternalLinkAltIcon />}
              iconPosition="right"
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
