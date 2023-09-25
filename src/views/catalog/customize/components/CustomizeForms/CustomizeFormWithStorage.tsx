import React, { FC, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataVolumeSpec, V1ContainerDiskSource } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  getTemplateOS,
  getTemplateVirtualMachineObject,
  OS_NAME_TYPES,
  replaceTemplateVM,
} from '@kubevirt-utils/resources/template';
import { Form } from '@patternfly/react-core';

import { addCDToTemplate } from '../../cd';
import { buildFields, overrideVirtualMachineDataVolumeSpec } from '../../utils';
import { ExpandableCustomizeSourceSection } from '../CustomizeSource/ExpandableCustomizeSourceSection';
import { ExpandableOptionsFields } from '../ExpandableOptionalFields';
import { FieldGroup } from '../FieldGroup';
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

  const { cdUpload, diskUpload, error, onSubmit } = useCustomizeFormSubmit({
    cdSource,
    diskSource,
    template: templateWithSources,
    withWindowsDrivers: windowsDrivers,
  });

  const [requiredFields, optionalFields] = useMemo(() => buildFields(template), [template]);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
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
      </Form>
    </FormProvider>
  );
};

export default CustomizeFormWithStorage;
