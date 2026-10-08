import { type FC, type ReactNode, useState } from 'react';

import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotations } from '@kubevirt-utils/resources/shared';
import { isSystemKey } from '@kubevirt-utils/utils/labelValidation/labelValidation';
import { getNoModalChangesTooltip } from '@kubevirt-utils/utils/text';
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

  const [initialAnnotations] = useState(() => getAnnotations(obj, {}) ?? {});
  const [annotations, setAnnotations] = useState<Record<number, AnnotationEntry>>(() =>
    getIdAnnotations(initialAnnotations),
  );
  const convertedAnnotations = toAnnotations(annotations);

  const annotationValidation = getAnnotationRowValidation(annotations);
  const { hasDuplicates, hasEmptyKeys } = annotationValidation;
  const noChangesMade = isEqualObject(convertedAnnotations, initialAnnotations);

  let submitDisabledTooltip: ReactNode = null;
  if (hasEmptyKeys) {
    submitDisabledTooltip = t('Annotation key is required');
  } else if (hasDuplicates) {
    submitDisabledTooltip = t('Duplicate keys found');
  } else if (noChangesMade) {
    submitDisabledTooltip = getNoModalChangesTooltip(t);
  }
  const initialKeys = new Set(Object.keys(initialAnnotations));

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

    return onSubmit(convertedAnnotations);
  };

  return (
    <TabModal<K8sResourceCommon>
      headerText={t('Edit annotations')}
      isDisabled={hasEmptyKeys || hasDuplicates || noChangesMade}
      isOpen={isOpen}
      obj={obj}
      onClose={onClose}
      onSubmit={onAnnotationsSubmit}
      submitDisabledTooltip={submitDisabledTooltip}
    >
      <Grid hasGutter>
        {Object.entries(annotations || {}).map(([id, { key, value }]) => (
          <AnnotationsModalRow
            annotation={{ key, value }}
            id={id}
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
