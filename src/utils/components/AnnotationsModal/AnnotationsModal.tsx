import * as React from 'react';

import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Grid } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import { AnnotationsModalRow } from './AnnotationsModalRow';

import './AnnotationsModal.scss';

const getIdAnnotations = (annotations: { [key: string]: string }) =>
  Object.fromEntries(Object.entries(annotations).map(([key, value], i) => [i, { key, value }]));

export const AnnotationsModal: React.FC<{
  obj: K8sResourceCommon;
  onSubmit: (annotations: { [key: string]: string }) => Promise<void | K8sResourceCommon>;
  isOpen: boolean;
  onClose: () => void;
}> = ({ obj, isOpen, onSubmit, onClose }) => {
  const { t } = useKubevirtTranslation();

  const [annotations, setAnnotations] = React.useState<{
    [id: number]: { [key: string]: string };
  }>({});

  const onAnnotationAdd = () => {
    const keys = new Set([...Object.keys(annotations)]);
    let index = 0;
    while (keys.has(index.toString())) {
      index++;
    }

    setAnnotations({
      ...annotations,
      [index]: {
        key: '',
        value: '',
      },
    });
  };

  const onAnnotationsSubmit = () => {
    const uniqWith = (arr, fn) =>
      arr.filter((element, index) => arr.findIndex((step) => fn(element, step)) === index);

    if (
      uniqWith(Object.values(annotations), (a, b) => a.key === b.key).length !==
      Object.values(annotations).length
    ) {
      return Promise.reject({ message: t('Duplicate keys found') });
    }

    const updatedAnnotations = Object.fromEntries(
      Object.entries(annotations).map(([, { key, value }]) => [key, value]),
    );

    return onSubmit(updatedAnnotations);
  };

  // reset annotations when modal is closed
  React.useEffect(() => {
    if (obj?.metadata?.annotations) {
      setAnnotations(getIdAnnotations(obj.metadata.annotations));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <TabModal<K8sResourceCommon>
      obj={obj}
      headerText={t('Edit annotations')}
      onSubmit={onAnnotationsSubmit}
      isOpen={isOpen}
      onClose={onClose}
    >
      <Grid hasGutter>
        {Object.entries(annotations || {}).map(([id, { key, value }]) => (
          <AnnotationsModalRow
            key={id}
            annotation={{ key, value }}
            onChange={(annotation) =>
              setAnnotations({
                ...annotations,
                [id]: annotation,
              })
            }
            onDelete={() =>
              setAnnotations(
                Object.fromEntries(Object.entries(annotations).filter(([k]) => k !== id)),
              )
            }
          />
        ))}
        <div className="co-toolbar__group co-toolbar__group--left">
          <Button
            isSmall
            className="pf-m-link--align-left"
            variant="link"
            onClick={() => onAnnotationAdd()}
            icon={<PlusCircleIcon />}
          >
            {t('Add more')}
          </Button>
        </div>
      </Grid>
    </TabModal>
  );
};
