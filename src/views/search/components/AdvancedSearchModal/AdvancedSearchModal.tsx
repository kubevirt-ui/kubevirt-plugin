import React, { FC, useMemo, useState } from 'react';

import { CAPACITY_UNITS } from '@kubevirt-utils/components/CapacityInput/utils';
import { LabelsEditor } from '@kubevirt-utils/components/LabelsEditor/LabelsEditor';
import { ModalComponentProps } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  DatePicker,
  DatePickerProps,
  Form,
  FormGroup,
  InputGroup,
  InputGroupItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Split,
  SplitItem,
  TextInput,
} from '@patternfly/react-core';

import MemoryUnitSelect from './components/MemoryUnitSelect';
import NumberInput from './components/NumberInput';
import NumberOperatorSelect, { NumberOperator } from './components/NumberOperatorSelect';
import ProjectMultiSelect from './components/ProjectMultiSelect';

export type AdvancedSearchInputs = Partial<{
  dateFromString: string;
  dateToString: string;
  description: string;
  ipAddress: string;
  labels: string[];
  memory: {
    operator: NumberOperator;
    unit: CAPACITY_UNITS;
    value: number;
  };
  name: string;
  projects: string[];
  vCPU: {
    operator: NumberOperator;
    value: number;
  };
}>;

type AdvancedSearchModalProps = Pick<ModalComponentProps, 'isOpen' | 'onClose'> & {
  onSubmit: (searchInputs: Required<AdvancedSearchInputs>) => void;
  prefillInputs?: AdvancedSearchInputs;
};

const AdvancedSearchModal: FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  prefillInputs = {},
}) => {
  const { t } = useKubevirtTranslation();

  const initialVCPU = { operator: NumberOperator.GreaterThan, value: 0 };
  const initialMemory = {
    operator: NumberOperator.GreaterThan,
    unit: CAPACITY_UNITS.GiB,
    value: 0,
  };

  const [name, setName] = useState(prefillInputs.name ?? '');
  const [projects, setProjects] = useState(prefillInputs.projects ?? []);
  const [description, setDescription] = useState(prefillInputs.description ?? '');
  const [labels, setLabels] = useState(prefillInputs.labels ?? []);
  const [ipAddress, setIpAddress] = useState(prefillInputs.ipAddress ?? '');
  const [dateFromString, setDateFromString] = useState(prefillInputs.dateFromString ?? '');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateToString, setDateToString] = useState(prefillInputs.dateToString ?? '');
  const [vCPU, setVCPU] = useState(prefillInputs.vCPU ?? initialVCPU);
  const [memory, setMemory] = useState(prefillInputs.memory ?? initialMemory);

  const [isValidDate, setIsValidDate] = useState(true);

  const isEmptySearch = useMemo<boolean>(
    () =>
      name === '' &&
      projects.length === 0 &&
      description === '' &&
      labels.length === 0 &&
      ipAddress === '' &&
      dateFromString === '' &&
      dateFrom === undefined &&
      dateToString === '' &&
      vCPU.value === 0 &&
      memory.value === 0,
    [
      name,
      projects,
      description,
      labels,
      ipAddress,
      dateFromString,
      dateFrom,
      dateToString,
      vCPU.value,
      memory.value,
    ],
  );

  const onDateChange: (
    setDateString: (dateString: string) => void,
    setDate?: (date: Date) => void,
  ) => DatePickerProps['onChange'] = (setDateString, setDate) => (_, dateString, date) => {
    if (date !== undefined) {
      setDateString(dateString);
      setDate && setDate(date);
    }
  };

  const onSelectLabel = (_event, selectedLabel: string) => {
    const labelExists = labels.some((item) => item === selectedLabel);

    if (labelExists) {
      setLabels((prevLabels) => prevLabels.filter((label) => label !== selectedLabel));
    } else {
      setLabels((prevLabels) => [...prevLabels, selectedLabel]);
    }
  };

  const resetForm = () => {
    setName('');
    setProjects([]);
    setDescription('');
    setLabels([]);
    setDateFromString(undefined);
    setDateToString(undefined);
    setVCPU(initialVCPU);
    setMemory(initialMemory);
    setIsValidDate(true);
  };

  const submitForm = () => {
    onSubmit({
      dateFromString,
      dateToString,
      description,
      ipAddress,
      labels,
      memory,
      name,
      projects,
      vCPU,
    });
  };

  const closeModal = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      className="ocs-modal co-catalog-page__overlay"
      isOpen={isOpen}
      onClose={closeModal}
      position="top"
      variant="medium"
    >
      <ModalHeader title={t('Advanced search')} />
      <ModalBody>
        <Form>
          <FormGroup label={t('Name')}>
            <TextInput onChange={(_, value) => setName(value)} type="text" value={name} />
          </FormGroup>
          <FormGroup label={t('Project')}>
            <ProjectMultiSelect projects={projects} setProjects={setProjects} />
          </FormGroup>
          <FormGroup label={t('Description')}>
            <TextInput
              onChange={(_, value) => setDescription(value)}
              type="text"
              value={description}
            />
          </FormGroup>
          <FormGroup label={t('Labels')}>
            <LabelsEditor
              addButtonText={t('Add label')}
              numLabelsToShow={Number.MAX_SAFE_INTEGER}
              onClear={() => setLabels([])}
              onSelect={onSelectLabel}
              textInputPlaceholder={t('Type to add label...')}
              values={labels}
            />
          </FormGroup>
          <FormGroup label={t('IP')}>
            <TextInput onChange={(_, value) => setIpAddress(value)} type="text" value={ipAddress} />
          </FormGroup>
          <FormGroup label={t('Date created')}>
            <Split>
              <DatePicker
                onChange={onDateChange(setDateFromString, setDateFrom)}
                placeholder={t('From')}
                value={dateFromString}
              />
              <SplitItem className="pf-v6-u-pt-sm pf-v6-u-px-md">{t('to')}</SplitItem>
              <DatePicker
                validators={[
                  (date) => {
                    if (date < dateFrom) {
                      setIsValidDate(false);
                      return "Date can't be before date from";
                    }
                    setIsValidDate(true);
                    return '';
                  },
                ]}
                onChange={onDateChange(setDateToString)}
                placeholder={t('To')}
                value={dateToString}
              />
            </Split>
          </FormGroup>
          <FormGroup label={t('vCPU')}>
            <InputGroup>
              <NumberOperatorSelect
                onSelect={(operator) => setVCPU((previous) => ({ ...previous, operator }))}
                selected={vCPU.operator}
              />
              <InputGroupItem>
                <NumberInput
                  setValue={(value) => setVCPU((previous) => ({ ...previous, value }))}
                  value={vCPU.value}
                />
              </InputGroupItem>
            </InputGroup>
          </FormGroup>
          <FormGroup label={t('Memory')}>
            <InputGroup>
              <NumberOperatorSelect
                onSelect={(operator) => setMemory((previous) => ({ ...previous, operator }))}
                selected={memory.operator}
              />
              <InputGroupItem>
                <NumberInput
                  setValue={(value) => setMemory((previous) => ({ ...previous, value }))}
                  value={memory.value}
                />
              </InputGroupItem>
              <MemoryUnitSelect
                onSelect={(unit) => setMemory((previous) => ({ ...previous, unit }))}
                selected={memory.unit}
              />
            </InputGroup>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button isDisabled={isEmptySearch || !isValidDate} onClick={submitForm} variant="primary">
          {t('Search')}
        </Button>
        <Button onClick={resetForm} variant="secondary">
          {t('Reset')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AdvancedSearchModal;
