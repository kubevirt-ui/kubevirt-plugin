import React from 'react';
import classNames from 'classnames';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label, LabelGroup } from '@patternfly/react-core';

import { extractKeyValueFromLabel, transformKeyValueToLabel } from './utils';

import './SelectorLabelMatchGroup.scss';

type SelectorLabelMatchGroupProps = {
  labels: { [key: string]: string };
  setLabels?: React.Dispatch<
    React.SetStateAction<{
      [key: string]: string;
    }>
  >;
  isVMILabel?: boolean;
};

const SelectorLabelMatchGroup: React.FC<SelectorLabelMatchGroupProps> = ({
  labels,
  setLabels,
  isVMILabel,
}) => {
  const { t } = useKubevirtTranslation();

  const onDeleteLabel = (key: string) => () =>
    setLabels((prevLabels) => {
      const updatedLabels = { ...prevLabels };
      delete updatedLabels[key];
      return updatedLabels;
    });

  const onEditLabel = (key: string) => (newText: string) => {
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

  const onAddLabel = (newText: string) => {
    const [newKey, newValue] = extractKeyValueFromLabel(newText);
    if (!!newKey && !!newValue) {
      setLabels((prevLabels) => ({ ...prevLabels, [newKey]: newValue }));
    }
  };

  return (
    <>
      <LabelGroup numLabels={10} className="mp-match-label-group" isEditable>
        {Object.keys(labels || {})?.map((key) => {
          return (
            <Label
              className={classNames({ 'kv-migration-policy__label-vm': isVMILabel })}
              key={key}
              color={isVMILabel ? 'grey' : 'blue'}
              isEditable
              onClose={onDeleteLabel(key)}
              onEditComplete={onEditLabel(key)}
            >
              {transformKeyValueToLabel(key, labels[key])}
            </Label>
          );
        })}
        <Label color="blue" variant="outline" isEditable onEditComplete={onAddLabel}>
          {t('Enter key=value')}
        </Label>
      </LabelGroup>
    </>
  );
};

export default SelectorLabelMatchGroup;
