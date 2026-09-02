import React, { type Dispatch, type FC, type SetStateAction } from 'react';
import classNames from 'classnames';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label, LabelGroup } from '@patternfly/react-core';

import { extractKeyValueFromLabel, transformKeyValueToLabel } from './utils';

import './SelectorLabelMatchGroup.scss';

type SelectorLabelMatchGroupProps = {
  isVMILabel?: boolean;
  labels: { [key: string]: string };
  setLabels?: Dispatch<
    SetStateAction<{
      [key: string]: string;
    }>
  >;
};

const SelectorLabelMatchGroup: FC<SelectorLabelMatchGroupProps> = ({
  isVMILabel,
  labels,
  setLabels,
}) => {
  const { t } = useKubevirtTranslation();

  const onDeleteLabel =
    (key: string): (() => void) =>
    (): void => {
      setLabels((prevLabels) => {
        const updatedLabels = { ...prevLabels };
        delete updatedLabels[key];
        return updatedLabels;
      });
    };

  const onEditLabel =
    (key: string): ((newText: string) => void) =>
    (newText: string): void => {
      const [newKey, newValue] = extractKeyValueFromLabel(newText);
      if (!!newKey && !!newValue) {
        setLabels((prevLabels) => {
          const updatedLabels = { ...prevLabels };
          delete updatedLabels[key];
          updatedLabels[newKey] = newValue;
          return updatedLabels;
        });
      }
    };

  const onAddLabel = (newText: string): void => {
    const [newKey, newValue] = extractKeyValueFromLabel(newText);
    if (!!newKey && !!newValue) {
      setLabels((prevLabels) => ({ ...prevLabels, [newKey]: newValue }));
    }
  };

  return (
    <>
      <LabelGroup className="mp-match-label-group" isEditable numLabels={10}>
        {Object.keys(labels || {})?.map((key) => {
          return (
            <Label
              className={classNames({ 'kv-migration-policy__label-vm': isVMILabel })}
              color={isVMILabel ? 'grey' : 'blue'}
              isEditable
              key={key}
              onClose={onDeleteLabel(key)}
              onEditComplete={(_event, val) => onEditLabel(key)(val)}
            >
              {transformKeyValueToLabel(key, labels[key])}
            </Label>
          );
        })}
        <Label
          color="blue"
          isEditable
          onEditComplete={(_event, val) => onAddLabel(val)}
          variant="outline"
        >
          {t('Enter key=value')}
        </Label>
      </LabelGroup>
    </>
  );
};

export default SelectorLabelMatchGroup;
