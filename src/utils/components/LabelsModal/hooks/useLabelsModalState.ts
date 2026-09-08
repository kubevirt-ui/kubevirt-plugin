import { useMemo, useState } from 'react';

import { logVMLabelsCollectedIfVirtualMachine } from '@kubevirt-utils/extensions/telemetry/labels';
import { type AutoAppliedLabel } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabels } from '@kubevirt-utils/resources/shared';
import {
  hasDuplicateKeys,
  validateLabelEntry,
} from '@kubevirt-utils/utils/labelValidation/labelValidation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { type LabelEntry } from '../constants';
import { entriesToLabels, getProtectedEntryIds, labelsToEntries } from '../utils';

type UseLabelsModalStateParams = {
  autoAppliedLabels?: AutoAppliedLabel[];
  initialLabels?: Record<string, string>;
  obj: K8sResourceCommon;
  onLabelsSubmit: (labels: Record<string, string>) => Promise<unknown>;
};

type UseLabelsModalStateReturn = {
  autoAppliedKeys: Set<string>;
  existingKeys: string[];
  handleSubmit: () => Promise<unknown>;
  hasEmptyKeys: boolean;
  hasValidationErrors: boolean;
  initialKeys: Set<string>;
  keyProtectedIds: Set<number>;
  labels: LabelEntry[];
  onLabelAdd: () => void;
  onLabelChange: (entryId: number, updated: { key: string; value: string }) => void;
  onLabelDelete: (entryId: number) => void;
  valueProtectedIds: Set<number>;
};

const useLabelsModalState = ({
  autoAppliedLabels = [],
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

  const autoAppliedKeys = useMemo(
    () => new Set(autoAppliedLabels.map((label) => label.key)),
    [autoAppliedLabels],
  );

  const protectedKeys = useMemo(
    () => new Map(autoAppliedLabels.map((label) => [label.key, Boolean(label.value)])),
    [autoAppliedLabels],
  );

  const { keyProtectedIds, valueProtectedIds } = useMemo(
    () => getProtectedEntryIds(labelsToEntries(initLabels), protectedKeys),
    [initLabels, protectedKeys],
  );

  const [labels, setLabels] = useState<LabelEntry[]>(initialEntries);

  const existingKeys = useMemo(() => labels.map(({ key }) => key), [labels]);

  const hasEmptyKeys = useMemo(() => labels.some(({ key }) => !key.trim()), [labels]);

  const hasValidationErrors = useMemo(
    () =>
      labels.some(({ key, value }) =>
        validateLabelEntry(key, value, t, initialKeys, existingKeys, autoAppliedKeys),
      ),
    [labels, t, initialKeys, existingKeys, autoAppliedKeys],
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
    autoAppliedKeys,
    existingKeys,
    handleSubmit,
    hasEmptyKeys,
    hasValidationErrors,
    initialKeys,
    keyProtectedIds,
    labels,
    onLabelAdd,
    onLabelChange,
    onLabelDelete,
    valueProtectedIds,
  };
};

export default useLabelsModalState;
