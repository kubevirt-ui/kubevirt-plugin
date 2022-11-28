import React, { FC, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { getTemplateNameParameterValue } from '@catalog/customize/utils';
import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useURLParams } from '@kubevirt-utils/hooks/useURLParams';
import {
  getTemplateOS,
  getTemplateVirtualMachineObject,
  OS_NAME_TYPES,
  replaceTemplateVM,
} from '@kubevirt-utils/resources/template';
import { Form } from '@patternfly/react-core';

import { addCDToTemplate } from '../../cd';
import {
  buildFields,
  getVirtualMachineNameField,
  overrideVirtualMachineDataVolumeSpec,
} from '../../utils';
import { ExpandableCustomizeSourceSection } from '../CustomizeSource/ExpandableCustomizeSourceSection';
import { ExpandableOptionsFields } from '../ExpandableOptionalFields';
import { FieldGroup } from '../FieldGroup';
import { FormActionGroup } from '../FormActionGroup';
import { FormError } from '../FormError';

import { useCustomizeFormSubmit } from './useCustomizeFormSubmit';

type CustomizeFormWithStorageProps = {
  template: V1Template;
  isBootSourceAvailable?: boolean;
};

const CustomizeFormWithStorage: FC<CustomizeFormWithStorageProps> = ({
  template,
  isBootSourceAvailable,
}) => {
  const methods = useForm();
  const { params } = useURLParams();
  const vmName = params.get('vmName') || getTemplateNameParameterValue(template);

  const [diskSource, setDiskSource] = useState<V1beta1DataVolumeSpec>();
  const [cdSource, setCDSource] = useState<V1beta1DataVolumeSpec>();

  const templateWithSources = useMemo(() => {
    let newTemplate = template;

    if (diskSource) {
      let virtualMachine = getTemplateVirtualMachineObject(template);

      virtualMachine = overrideVirtualMachineDataVolumeSpec(virtualMachine, diskSource);
      newTemplate = replaceTemplateVM(template, virtualMachine);
    }

    if (cdSource) newTemplate = addCDToTemplate(newTemplate, cdSource);

    return newTemplate;
  }, [cdSource, template, diskSource]);

  const [windowsDrivers, setWindowsDrivers] = useState(
    getTemplateOS(template) === OS_NAME_TYPES.windows,
  );

  const { onSubmit, onCancel, diskUpload, cdUpload, loaded, error } = useCustomizeFormSubmit({
    template: templateWithSources,
    diskSource,
    cdSource,
    withWindowsDrivers: windowsDrivers,
  });

  const [requiredFields, optionalFields] = useMemo(() => buildFields(template), [template]);

  const nameField = useMemo(() => getVirtualMachineNameField(vmName), [vmName]);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        <FieldGroup field={nameField} showError={error} />

        {requiredFields?.map((field) => (
          <FieldGroup key={field.name} field={field} showError={error} />
        ))}

        <ExpandableCustomizeSourceSection
          diskSource={diskSource}
          isBootSourceAvailable={isBootSourceAvailable}
          setDiskSource={setDiskSource}
          template={template}
          withDrivers={windowsDrivers}
          setDrivers={setWindowsDrivers}
          cdSource={cdSource}
          setCDSource={setCDSource}
          diskUpload={diskUpload}
          cdUpload={cdUpload}
        />

        <ExpandableOptionsFields optionalFields={optionalFields} />

        <FormError error={error} />
        <FormActionGroup loading={!loaded} onCancel={onCancel} />
      </Form>
    </FormProvider>
  );
};

export default CustomizeFormWithStorage;
