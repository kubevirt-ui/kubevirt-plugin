import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getResourceUrl } from '@kubevirt-utils/resource';
import {
  Alert,
  Button,
  ButtonVariant,
  Checkbox,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  FormGroup,
  Skeleton,
  Split,
  SplitItem,
  Stack,
  StackItem,
  TextInput,
  Title,
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

import { quickCreateVM } from '../../..//utils/quick-create-vm';
import { useVmTemplateSource } from '../../../utils/vm-template-source/useVmTemplateSource';
import { useProcessedTemplate } from '../../hooks/useProcessedTemplate';
import { generateVMName } from '../../utils/helpers';

type TemplateCatalogDrawerFooterProps = {
  namespace: string;
  template: V1Template | undefined;
  onCancel: () => void;
};

export const TemplatesCatalogDrawerFooter: React.FC<TemplateCatalogDrawerFooterProps> = ({
  namespace,
  template,
  onCancel,
}) => {
  const history = useHistory();
  const { t } = useKubevirtTranslation();
  const { isBootSourceAvailable, loaded: bootSourceLoaded } = useVmTemplateSource(template);
  const [processedTemplate, processedTemplateLoaded] = useProcessedTemplate(template);
  const [vmName, setVmName] = React.useState(generateVMName(template));
  const [startVM, setStartVM] = React.useState(true);
  const [isQuickCreating, setIsQuickCreating] = React.useState(false);
  const [quickCreateError, setQuickCreateError] = React.useState(undefined);

  const onQuickCreate = () => {
    setIsQuickCreating(true);
    quickCreateVM(template, { name: vmName, namespace, startVM })
      .then((vm: any) => {
        setIsQuickCreating(false);
        history.push(getResourceUrl(VirtualMachineModel, vm));
      })
      .catch((err) => {
        setIsQuickCreating(false);
        setQuickCreateError(err);
      });
  };

  const canQuickCreate = !!processedTemplate && isBootSourceAvailable;
  const loaded = bootSourceLoaded && processedTemplateLoaded;

  return loaded ? (
    <Stack className="template-catalog-drawer-info">
      <StackItem className="template-catalog-drawer-footer-section">
        <Split hasGutter>
          <Button
            data-test-id="customize-vm-btn"
            variant={canQuickCreate ? ButtonVariant.secondary : ButtonVariant.primary}
            onClick={() => onCancel()}
          >
            {t('Customize VirtualMachine')}
          </Button>
          {!canQuickCreate && (
            <Button variant={ButtonVariant.link} onClick={() => onCancel()}>
              {t('Cancel')}
            </Button>
          )}
        </Split>
      </StackItem>
      {canQuickCreate && (
        <div className="template-catalog-drawer-footer-section">
          <Stack hasGutter>
            <StackItem>
              <Split hasGutter>
                <SplitItem>
                  <Title headingLevel="h1" size="lg">
                    {t('Quick create VirtualMachine')}
                  </Title>
                </SplitItem>
                <SplitItem className="template-catalog-drawer-footer-tooltip">
                  <Tooltip
                    position={TooltipPosition.right}
                    content={<div>{t('This template supports quick create VirtualMachine')}</div>}
                  >
                    <OutlinedQuestionCircleIcon />
                  </Tooltip>
                </SplitItem>
              </Split>
            </StackItem>
            <form className="template-catalog-drawer-form" id="quick-create-form">
              <Stack hasGutter>
                <StackItem>
                  <Split hasGutter>
                    <SplitItem>
                      <FormGroup
                        label={t('VirtualMachine name')}
                        isRequired
                        className="template-catalog-drawer-form-name"
                        fieldId="vm-name-field"
                      >
                        <TextInput
                          isRequired
                          type="text"
                          data-test-id="vm-name-input"
                          name="vmname"
                          aria-label="virtualmachine name"
                          value={vmName}
                          onChange={(v) => setVmName(v)}
                        />
                      </FormGroup>
                    </SplitItem>
                    <SplitItem>
                      <DescriptionList>
                        <DescriptionListGroup>
                          <DescriptionListTerm>{t('Project')}</DescriptionListTerm>
                          <DescriptionListDescription>{namespace}</DescriptionListDescription>
                        </DescriptionListGroup>
                      </DescriptionList>
                    </SplitItem>
                  </Split>
                </StackItem>
                <StackItem />
                <StackItem>
                  <Checkbox
                    id="start-after-create-checkbox"
                    isChecked={startVM}
                    onChange={(v) => setStartVM(v)}
                    label={t('Start this VirtualMachine after creation')}
                  />
                </StackItem>
                <StackItem />
                {quickCreateError && (
                  <StackItem>
                    <Alert variant="danger" title={t('Quick create error')} isInline>
                      {quickCreateError.message}
                    </Alert>
                  </StackItem>
                )}
                <StackItem>
                  <Split hasGutter>
                    <Button
                      data-test-id="quick-create-vm-btn"
                      type="submit"
                      form="quick-create-form"
                      isLoading={isQuickCreating}
                      isDisabled={!isBootSourceAvailable || isQuickCreating || !vmName}
                      onClick={(e) => {
                        e.preventDefault();
                        onQuickCreate();
                      }}
                    >
                      {t('Quick create VirtualMachine')}
                    </Button>
                    <Button variant={ButtonVariant.link} onClick={() => onCancel()}>
                      {t('Cancel')}
                    </Button>
                  </Split>
                </StackItem>
              </Stack>
            </form>
          </Stack>
        </div>
      )}
    </Stack>
  ) : (
    <Stack className="template-catalog-drawer-info" hasGutter>
      <StackItem className="template-catalog-drawer-footer-section">
        <Skeleton height="35px" width="40%" />
      </StackItem>
    </Stack>
  );
};
