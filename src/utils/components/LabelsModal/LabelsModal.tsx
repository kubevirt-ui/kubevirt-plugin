import React, {
  ChangeEvent,
  DetailedHTMLProps,
  FC,
  HTMLAttributes,
  memo,
  useMemo,
  useState,
} from 'react';
import TagsInput from 'react-tagsinput';

import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Label as PFLabel, Stack, StackItem, Truncate } from '@patternfly/react-core';

import { isLabelValid, labelsArrayToObject, labelsToArray } from './utils';

import './LabelsModal.scss';

type LabelsModalProps = {
  initialLabels?: {
    [key: string]: string;
  };
  isOpen: boolean;
  labelClassName?: string;
  modalDescriptionText?: string;
  obj: K8sResourceCommon;
  onClose: () => void;
  onLabelsSubmit: (labels: { [key: string]: string }) => Promise<K8sResourceCommon | void>;
};

export const LabelsModal: FC<LabelsModalProps> = memo(
  ({
    initialLabels,
    isOpen,
    labelClassName,
    modalDescriptionText,
    obj,
    onClose,
    onLabelsSubmit,
  }) => {
    const { t } = useKubevirtTranslation();
    const [inputValue, setInputValue] = useState('');
    const [isInputValid, setIsInputValid] = useState(true);

    const initLabels = useMemo(() => {
      if (!isEmpty(initialLabels)) return initialLabels;
      if (!isEmpty(obj?.metadata?.labels)) return obj?.metadata?.labels;
      return {};
    }, [initialLabels, obj?.metadata?.labels]);
    const [labels, setLabels] = useState<string[]>(labelsToArray(initLabels));

    const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (value === '') {
        setInputValue(value);
        setIsInputValid(true);
        return;
      }
      setInputValue(value);
      setIsInputValid(isLabelValid(value));
    };

    const handleLabelsChange = (newLabels: string[], changed: string[]) => {
      const newLabel = changed[0];
      if (!isLabelValid(newLabel)) {
        setIsInputValid(false);
        return;
      }

      // duplicate labels
      if (newLabels.filter((l) => l === newLabel).length > 1) {
        setIsInputValid(false);
        return;
      }

      // if key exists, overwrite value
      if (newLabels.filter((l) => l.split('=')[0] === newLabel.split('=')[0]).length > 1) {
        const filteredLabels = newLabels.filter((l) => l.split('=')[0] !== newLabel.split('=')[0]);
        setLabels([...filteredLabels, newLabel]);
        setInputValue('');
        return;
      }

      setLabels(newLabels);
      setInputValue('');
    };

    const renderTag = ({ getTagDisplayValue, key, onRemove, tag }) => {
      return (
        <PFLabel
          className={'co-label tag-item-content'.concat(labelClassName || '')}
          key={key}
          onClose={() => onRemove(key)}
        >
          <Truncate content={getTagDisplayValue(tag)} />
        </PFLabel>
      );
    };

    const inputProps = {
      autoFocus: true,
      className: 'input'.concat(isInputValid ? '' : ' invalid-tag'),
      ['data-test']: 'tags-input',
      id: 'tags-input',
      onChange: onInputChange,
      placeholder: labels.length === 0 ? 'app=frontend' : '',
      spellCheck: 'false',
      value: inputValue,
    };

    // Keys that add tags: Enter
    const addKeys = [13];
    // Backspace deletes tags, but not if there is text being edited in the input field
    const removeKeys = inputValue.length ? [] : [8];

    return (
      <TabModal
        headerText={t('Edit labels')}
        isOpen={isOpen}
        obj={obj}
        onClose={onClose}
        onSubmit={() => onLabelsSubmit(labelsArrayToObject(labels))}
      >
        <Stack hasGutter>
          <StackItem>
            {modalDescriptionText ??
              t(
                'Labels help you organize and select resources. Adding labels below will let you query for objects that have similar, overlapping or dissimilar labels.',
              )}
          </StackItem>
          <StackItem>
            <div className="kv-labels-modal-body">
              <tags-input>
                <TagsInput
                  addKeys={addKeys}
                  addOnBlur
                  className="tags"
                  inputProps={inputProps}
                  onChange={handleLabelsChange}
                  removeKeys={removeKeys}
                  renderTag={renderTag}
                  value={labels}
                />
              </tags-input>
            </div>
          </StackItem>
        </Stack>
      </TabModal>
    );
  },
);

// console is declaring a new html element for some reason, we have to copy it for css reasons.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'tags-input': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
