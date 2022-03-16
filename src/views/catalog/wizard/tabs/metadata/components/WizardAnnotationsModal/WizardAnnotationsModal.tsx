import * as React from 'react';

import { UpdateValidatedVM } from '@catalog/utils/WizardVMContext';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Grid } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import { WizardAnnotationsModalRow } from './WizardAnnotationsModalRow';

import './WizardAnnotationsModal.scss';

const getIdAnnotations = (annotations: { [key: string]: string }) =>
  Object.fromEntries(Object.entries(annotations).map(([key, value], i) => [i, { key, value }]));

export const WizardAnnotationsModal: React.FC<{
  vm: V1VirtualMachine;
  updateVM: UpdateValidatedVM;
  isOpen: boolean;
  onClose: () => void;
}> = ({ vm, isOpen, updateVM, onClose }) => {
  const { t } = useKubevirtTranslation();

  const [annotations, setAnnotations] =
    React.useState<{ [id: number]: { [key: string]: string } }>();

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

  const onSubmit = () => {
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

    return updateVM((vmDraft) => {
      vmDraft.metadata.annotations = updatedAnnotations;
    });
  };

  // reset annotations when modal is closed
  React.useEffect(() => {
    if (vm.metadata.annotations) {
      setAnnotations(getIdAnnotations(vm.metadata.annotations));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <TabModal<V1VirtualMachine>
      obj={vm}
      headerText={t('Edit annotations')}
      onSubmit={onSubmit}
      isOpen={isOpen}
      onClose={onClose}
    >
      <Grid hasGutter>
        {Object.entries(annotations || {}).map(([id, { key, value }]) => (
          <WizardAnnotationsModalRow
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
