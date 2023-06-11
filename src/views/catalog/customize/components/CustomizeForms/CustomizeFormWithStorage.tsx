import React, { FC, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { getTemplateNameParameterValue } from '@catalog/customize/utils';
import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataVolumeSpec, V1ContainerDiskSource } from '@kubevirt-ui/kubevirt-api/kubevirt';
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
  isBootSourceAvailable?: boolean;
  template: V1Template;
};

const CustomizeFormWithStorage: FC<CustomizeFormWithStorageProps> = ({
  isBootSourceAvailable,
  template,
}) => {
  const methods = useForm();
  const { params } = useURLParams();
  const vmName = params.get('vmName') || getTemplateNameParameterValue(template);

  const [diskSource, setDiskSource] = useState<V1beta1DataVolumeSpec>();
  const [cdSource, setCDSource] = useState<V1beta1DataVolumeSpec | V1ContainerDiskSource>();

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

  const { cdUpload, diskUpload, error, loaded, onCancel, onSubmit } = useCustomizeFormSubmit({
    cdSource,
    diskSource,
    template: templateWithSources,
    withWindowsDrivers: windowsDrivers,
  });

  const [requiredFields, optionalFields] = useMemo(() => buildFields(template), [template]);

  const nameField = useMemo(() => getVirtualMachineNameField(vmName), [vmName]);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        <FieldGroup field={nameField} showError={error} />

        {requiredFields?.map((field) => (
          <FieldGroup field={field} key={field.name} showError={error} />
        ))}

        <ExpandableCustomizeSourceSection
          cdSource={cdSource}
          cdUpload={cdUpload}
          diskSource={diskSource}
          diskUpload={diskUpload}
          isBootSourceAvailable={isBootSourceAvailable}
          setCDSource={setCDSource}
          setDiskSource={setDiskSource}
          setDrivers={setWindowsDrivers}
          template={template}
          withDrivers={windowsDrivers}
        />

        <ExpandableOptionsFields optionalFields={optionalFields} />

        <FormError error={error} />
        <FormActionGroup loading={!loaded} onCancel={onCancel} />
      </Form>
    </FormProvider>
  );
};

export default CustomizeFormWithStorage;
