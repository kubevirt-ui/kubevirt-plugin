import React, { type FC, useEffect, useState } from 'react';

import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Grid } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import { AnnotationsModalRow } from './AnnotationsModalRow';

import './AnnotationsModal.scss';

const uniqWith = <T,>(arr: T[], compareFn: (a: T, b: T) => boolean): T[] =>
  arr.filter((element, index) => arr.findIndex((step) => compareFn(element, step)) === index);

const getIdAnnotations = (annotations: {
  [key: string]: string;
}): { [k: string]: { key: string; value: string } } =>
  Object.fromEntries(Object.entries(annotations).map(([key, value], i) => [i, { key, value }]));

export const AnnotationsModal: FC<{
  isOpen: boolean;
  obj: K8sResourceCommon;
  onClose: () => void;
  onSubmit: (annotations: { [key: string]: string }) => Promise<K8sResourceCommon | void>;
}> = ({ isOpen, obj, onClose, onSubmit }) => {
  const { t } = useKubevirtTranslation();

  const [annotations, setAnnotations] = useState<{
    [id: number]: { [key: string]: string };
  }>({});

  const onAnnotationAdd = (): void => {
    const keys = new Set(Object.keys(annotations));
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

  const onAnnotationsSubmit = (): Promise<K8sResourceCommon | void> => {
    if (
      uniqWith(Object.values(annotations), (a, b) => a.key === b.key).length !==
      Object.values(annotations).length
    ) {
      return Promise.reject({ message: t('Duplicate keys found') });
    }

    const updatedAnnotations: Record<string, string> = Object.fromEntries(
      Object.entries(annotations).map(([, { key, value }]): [string, string] => [key, value]),
    );

    return onSubmit(updatedAnnotations);
  };

  // reset annotations when modal is closed
  useEffect(() => {
    if (obj?.metadata?.annotations) {
      setAnnotations(getIdAnnotations(obj.metadata.annotations));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <TabModal<K8sResourceCommon>
      headerText={t('Edit annotations')}
      isOpen={isOpen}
      obj={obj}
      onClose={onClose}
      onSubmit={onAnnotationsSubmit}
    >
      <Grid hasGutter>
        {Object.entries(annotations || {}).map(([id, { key, value }]) => (
          <AnnotationsModalRow
            annotation={{ key, value }}
            key={id}
            onChange={(annotation) =>
              setAnnotations({
                ...annotations,
                [id]: annotation,
              })
            }
            onDelete={() =>
              setAnnotations(
                Object.fromEntries(
                  Object.entries(annotations).filter(([annotationId]) => annotationId !== id),
                ),
              )
            }
          />
        ))}
        <div className="co-toolbar__group co-toolbar__group--left">
          <Button
            className="pf-m-link--align-left"
            icon={<PlusCircleIcon />}
            onClick={() => onAnnotationAdd()}
            variant={ButtonVariant.link}
          >
            {t('Add more')}
          </Button>
        </div>
      </Grid>
    </TabModal>
  );
};
