import React, { type ChangeEvent, type FC, memo, type ReactNode, useMemo, useState } from 'react';
import TagsInput from 'react-tagsinput';

import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { logVMLabelsCollectedIfVirtualMachine } from '@kubevirt-utils/extensions/telemetry/labels';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Label as PFLabel, Stack, StackItem, Truncate } from '@patternfly/react-core';

import { isLabelValid, labelsArrayToObject, labelsToArray, processLabelChange } from './utils';

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
  onLabelsSubmit: (labels: { [key: string]: string }) => Promise<unknown>;
};

type RenderTagProps = {
  getTagDisplayValue: (tagValue: string) => string;
  key: number;
  onRemove: (tagKey: number) => void;
  tag: string;
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
      if (initialLabels !== undefined) {
        return initialLabels;
      }

      if (!isEmpty(obj?.metadata?.labels)) {
        return obj?.metadata?.labels;
      }

      return {};
    }, [initialLabels, obj?.metadata?.labels]);

    const [labels, setLabels] = useState<string[]>(() => labelsToArray(initLabels));

    const onInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
      const value = e.target.value;

      if (value === '') {
        setInputValue(value);
        setIsInputValid(true);
        return;
      }
      setInputValue(value);
      setIsInputValid(isLabelValid(value));
    };

    const handleLabelsChange = (newLabels: string[], changed: string[]): void => {
      const result = processLabelChange(newLabels, changed);
      if (!result.isValid) {
        setIsInputValid(false);
        return;
      }
      setLabels(result.labels);
      setInputValue('');
    };

    const renderTag = ({ getTagDisplayValue, key, onRemove, tag }: RenderTagProps): ReactNode => {
      return (
        <PFLabel
          className={'co-label tag-item-content'.concat(labelClassName ?? '')}
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

    const handleSubmit = async (): Promise<unknown> => {
      const updatedLabels = labelsArrayToObject(labels);
      const result = await onLabelsSubmit(updatedLabels);
      logVMLabelsCollectedIfVirtualMachine(obj, updatedLabels);
      return result;
    };

    return (
      <TabModal
        headerText={t('Edit labels')}
        isOpen={isOpen}
        obj={obj}
        onClose={onClose}
        onSubmit={handleSubmit}
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
