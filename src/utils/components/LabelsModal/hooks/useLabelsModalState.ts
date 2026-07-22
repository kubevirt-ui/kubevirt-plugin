import { useMemo, useState } from 'react';

import { logVMLabelsCollectedIfVirtualMachine } from '@kubevirt-utils/extensions/telemetry/labels';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  hasDuplicateKeys,
  validateLabelEntry,
} from '@kubevirt-utils/utils/labelValidation/labelValidation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { LabelEntry } from '../constants';
import { entriesToLabels, labelsToEntries } from '../utils';
import { getLabels } from '@kubevirt-utils/resources/shared';

type UseLabelsModalStateParams = {
  initialLabels?: Record<string, string>;
  obj: K8sResourceCommon;
  onLabelsSubmit: (labels: Record<string, string>) => Promise<unknown>;
};

type UseLabelsModalStateReturn = {
  existingKeys: string[];
  handleSubmit: () => Promise<unknown>;
  hasEmptyKeys: boolean;
  hasValidationErrors: boolean;
  initialKeys: Set<string>;
  labels: LabelEntry[];
  onLabelAdd: () => void;
  onLabelChange: (entryId: number, updated: { key: string; value: string }) => void;
  onLabelDelete: (entryId: number) => void;
};

const useLabelsModalState = ({
  initialLabels,
  obj,
  onLabelsSubmit,
}: UseLabelsModalStateParams): UseLabelsModalStateReturn => {
  const { t } = useKubevirtTranslation();

  const initLabels = useMemo(() => {
    if (initialLabels !== undefined) return initialLabels;
    return getLabels(obj, {});
  }, [initialLabels, obj]);

  const initialEntries = useMemo(() => {
    const entries = labelsToEntries(initLabels);
    return isEmpty(entries) ? [{ id: 0, key: '', value: '' }] : entries;
  }, [initLabels]);

  const initialKeys = useMemo(() => new Set(Object.keys(initLabels)), [initLabels]);

  const [labels, setLabels] = useState<LabelEntry[]>(initialEntries);

  const existingKeys = useMemo(() => labels.map(({ key }) => key), [labels]);

  const hasEmptyKeys = useMemo(() => labels.some(({ key }) => !key.trim()), [labels]);

  const hasValidationErrors = useMemo(
    () =>
      labels.some(({ key, value }) => validateLabelEntry(key, value, t, initialKeys, existingKeys)),
    [labels, t, initialKeys, existingKeys],
  );

  const onLabelAdd = (): void => {
    const nextId = labels.length ? labels[labels.length - 1].id + 1 : 0;
    setLabels([...labels, { id: nextId, key: '', value: '' }]);
  };

  const onLabelChange = (entryId: number, updated: { key: string; value: string }): void => {
    setLabels(labels.map((entry) => (entry.id === entryId ? { ...entry, ...updated } : entry)));
  };

  const onLabelDelete = (entryId: number): void => {
    setLabels(labels.filter((entry) => entry.id !== entryId));
  };

  const handleSubmit = async (): Promise<unknown> => {
    if (hasDuplicateKeys(existingKeys)) {
      return Promise.reject({ message: t('Duplicate keys found') });
    }
    const updatedLabels = entriesToLabels(labels);
    const result = await onLabelsSubmit(updatedLabels);
    logVMLabelsCollectedIfVirtualMachine(obj, updatedLabels);
    return result;
  };

  return {
    existingKeys,
    handleSubmit,
    hasEmptyKeys,
    hasValidationErrors,
    initialKeys,
    labels,
    onLabelAdd,
    onLabelChange,
    onLabelDelete,
  };
};

export default useLabelsModalState;
