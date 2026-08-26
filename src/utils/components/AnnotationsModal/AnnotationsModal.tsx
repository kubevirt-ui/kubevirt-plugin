import React, { type FC, useEffect, useMemo, useState } from 'react';

import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotations } from '@kubevirt-utils/resources/shared';
import { isSystemKey } from '@kubevirt-utils/utils/labelValidation/labelValidation';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Grid } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import { AnnotationsModalRow } from './AnnotationsModalRow';
import {
  type AnnotationEntry,
  getAnnotationRowValidation,
  getIdAnnotations,
  toAnnotations,
} from './utils';

import './AnnotationsModal.scss';

export const AnnotationsModal: FC<{
  isOpen: boolean;
  obj: K8sResourceCommon;
  onClose: () => void;
  onSubmit: (annotations: { [key: string]: string }) => Promise<K8sResourceCommon | void>;
}> = ({ isOpen, obj, onClose, onSubmit }) => {
  const { t } = useKubevirtTranslation();

  const [annotations, setAnnotations] = useState<Record<number, AnnotationEntry>>({});
  const { hasDuplicates, hasEmptyKeys } = getAnnotationRowValidation(annotations);
  const initialKeys = useMemo(() => new Set(Object.keys(getAnnotations(obj, {}))), [obj]);

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
    if (hasDuplicates) {
      return Promise.reject({ message: t('Duplicate keys found') });
    }

    return onSubmit(toAnnotations(annotations));
  };

  useEffect(() => {
    const baseAnnotations = getAnnotations(obj, {});
    const idAnnotations = getIdAnnotations(baseAnnotations);

    setAnnotations(idAnnotations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <TabModal<K8sResourceCommon>
      headerText={t('Edit annotations')}
      isDisabled={hasEmptyKeys || hasDuplicates}
      isOpen={isOpen}
      obj={obj}
      onClose={onClose}
      onSubmit={onAnnotationsSubmit}
    >
      <Grid hasGutter>
        {Object.entries(annotations || {}).map(([id, { key, value }]) => (
          <AnnotationsModalRow
            annotation={{ key, value }}
            isProtected={isSystemKey(key) && initialKeys.has(key)}
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
