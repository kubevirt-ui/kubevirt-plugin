import React, { FC, useMemo, useState } from 'react';

import { ModalComponentProps } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  Divider,
  Form,
  FormGroup,
  InputGroup,
  InputGroupItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
} from '@patternfly/react-core';

import NumberOperatorSelect from '../../../../utils/components/NumberOperatorSelect/NumberOperatorSelect';
import { AdvancedSearchInputs } from '../../utils/types';

import DateFromToPicker from './components/DateFromToPicker';
import LabelsMultiSelect from './components/LabelsMultiSelect';
import MemoryUnitSelect from './components/MemoryUnitSelect';
import ModalExpandableSection from './components/ModalExpandableSection';
import NumberInput from './components/NumberInput';
import ProjectMultiSelect from './components/ProjectMultiSelect';
import { initialMemory, initialVCPU } from './constants';

import './advanced-search-modal.scss';

type AdvancedSearchModalProps = Pick<ModalComponentProps, 'isOpen' | 'onClose'> & {
  onSubmit: (searchInputs: AdvancedSearchInputs) => void;
  prefillInputs?: AdvancedSearchInputs;
};

const AdvancedSearchModal: FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  prefillInputs = {},
}) => {
  const { t } = useKubevirtTranslation();

  const [name, setName] = useState(prefillInputs.name ?? '');
  const [projects, setProjects] = useState(prefillInputs.projects ?? []);
  const [description, setDescription] = useState(prefillInputs.description ?? '');
  const [labels, setLabels] = useState(prefillInputs.labels ?? []);
  const [ip, setIP] = useState(prefillInputs.ip ?? '');
  const [dateFromString, setDateFromString] = useState(prefillInputs.dateCreatedFrom ?? '');
  const [dateToString, setDateToString] = useState(prefillInputs.dateCreatedTo ?? '');
  const [vCPU, setVCPU] = useState(prefillInputs.vCPU ?? initialVCPU);
  const [memory, setMemory] = useState(prefillInputs.memory ?? initialMemory);

  const [isValidDate, setIsValidDate] = useState(true);

  const isEmptyForm = useMemo<boolean>(
    () =>
      name === '' &&
      projects.length === 0 &&
      description === '' &&
      labels.length === 0 &&
      ip === '' &&
      dateFromString === '' &&
      dateToString === '' &&
      isNaN(vCPU.value) &&
      isNaN(memory.value),
    [
      name,
      projects,
      description,
      labels,
      ip,
      dateFromString,
      dateToString,
      vCPU.value,
      memory.value,
    ],
  );

  const resetForm = () => {
    setName('');
    setProjects([]);
    setDescription('');
    setLabels([]);
    setIP('');
    setDateFromString('');
    setDateToString('');
    setVCPU(initialVCPU);
    setMemory(initialMemory);
    setIsValidDate(true);
  };

  const submitForm = () => {
    onSubmit({
      dateCreatedFrom: dateFromString,
      dateCreatedTo: dateToString,
      description,
      ip,
      labels,
      memory,
      name,
      projects,
      vCPU,
    });
  };

  return (
    <Modal
      className="ocs-modal co-catalog-page__overlay"
      isOpen={isOpen}
      onClose={onClose}
      position="top"
      variant="medium"
    >
      <ModalHeader title={t('Advanced search')} />
      <ModalBody>
        <div data-test="adv-search-details">
          <ModalExpandableSection title={t('Details')}>
            <Form>
              <FormGroup label={t('Name')}>
                <TextInput
                  data-test="adv-search-vm-name"
                  onChange={(_, value) => setName(value)}
                  type="text"
                  value={name}
                />
              </FormGroup>
              <FormGroup label={t('Project')}>
                <ProjectMultiSelect
                  data-test="adv-search-vm-project"
                  projects={projects}
                  setProjects={setProjects}
                />
              </FormGroup>
              <FormGroup label={t('Description')}>
                <TextInput
                  data-test="adv-search-vm-description"
                  onChange={(_, value) => setDescription(value)}
                  type="text"
                  value={description}
                />
              </FormGroup>
              <FormGroup label={t('Labels')}>
                <LabelsMultiSelect
                  data-test="adv-search-vm-labels"
                  initialInputValue={prefillInputs.labelInputText}
                  labels={labels}
                  setLabels={setLabels}
                />
              </FormGroup>
              <FormGroup label={t('Date created')}>
                <DateFromToPicker
                  data-test="adv-search-date"
                  dateFromString={dateFromString}
                  dateToString={dateToString}
                  setDateFromString={setDateFromString}
                  setDateToString={setDateToString}
                  setIsValidDate={setIsValidDate}
                />
              </FormGroup>
              <FormGroup label={t('vCPU')}>
                <InputGroup>
                  <NumberOperatorSelect
                    data-test="adv-search-vcpu-operator"
                    onSelect={(operator) => setVCPU((previous) => ({ ...previous, operator }))}
                    selected={vCPU.operator}
                  />
                  <InputGroupItem>
                    <NumberInput
                      data-test="adv-search-vcpu-value"
                      setValue={(value) => setVCPU((previous) => ({ ...previous, value }))}
                      value={vCPU.value}
                    />
                  </InputGroupItem>
                </InputGroup>
              </FormGroup>
              <FormGroup label={t('Memory')}>
                <InputGroup>
                  <NumberOperatorSelect
                    data-test="adv-search-mem-operator"
                    onSelect={(operator) => setMemory((previous) => ({ ...previous, operator }))}
                    selected={memory.operator}
                  />
                  <InputGroupItem>
                    <NumberInput
                      data-test="adv-search-mem-value"
                      setValue={(value) => setMemory((previous) => ({ ...previous, value }))}
                      value={memory.value}
                    />
                  </InputGroupItem>
                  <MemoryUnitSelect
                    data-test="adv-search-mem-unit"
                    onSelect={(unit) => setMemory((previous) => ({ ...previous, unit }))}
                    selected={memory.unit}
                  />
                </InputGroup>
              </FormGroup>
            </Form>
          </ModalExpandableSection>
        </div>
        <Divider className="pf-v6-u-my-md" />
        <div data-test="adv-search-network">
          <ModalExpandableSection isDefaultExpanded={false} title={t('Network')}>
            <Form>
              <FormGroup label={t('IP')}>
                <TextInput
                  data-test="adv-search-vm-ip"
                  onChange={(_, value) => setIP(value)}
                  type="text"
                  value={ip}
                />
              </FormGroup>
            </Form>
          </ModalExpandableSection>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button isDisabled={isEmptyForm || !isValidDate} onClick={submitForm}>
          {t('Search')}
        </Button>
        <Button onClick={resetForm} variant={ButtonVariant.secondary}>
          {t('Reset')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AdvancedSearchModal;
