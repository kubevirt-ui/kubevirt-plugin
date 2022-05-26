import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTemplateOS,
  getTemplateVirtualMachineObject,
  OS_NAME_TYPES,
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
};

const CustomizeFormWithStorage: React.FC<CustomizeFormWithStorageProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const methods = useForm();

  const [diskSource, setDiskSource] = React.useState<V1beta1DataVolumeSpec>();
  const [cdSource, setCDSource] = React.useState<V1beta1DataVolumeSpec>();

  const templateWithSources = React.useMemo(() => {
    let newTemplate = template;

    if (diskSource) {
      let virtualMachine = getTemplateVirtualMachineObject(template);

      virtualMachine = overrideVirtualMachineDataVolumeSpec(virtualMachine, diskSource);
      newTemplate = { ...template, objects: [virtualMachine] };
    }

    if (cdSource) newTemplate = addCDToTemplate(newTemplate, cdSource);

    return newTemplate;
  }, [cdSource, template, diskSource]);

  const [windowsDrivers, setWindowsDrivers] = React.useState(
    getTemplateOS(template) === OS_NAME_TYPES.windows,
  );

  const { onSubmit, relevantUpload, loaded, error } = useCustomizeFormSubmit({
    template: templateWithSources,
    diskSource,
    withWindowsDrivers: windowsDrivers,
  });

  const [requiredFields, optionalFields] = React.useMemo(() => buildFields(template), [template]);
  const nameField = React.useMemo(() => getVirtualMachineNameField(template, t), [template, t]);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        <FieldGroup field={nameField} showError={error} />

        {requiredFields?.map((field) => (
          <FieldGroup key={field.name} field={field} showError={error} />
        ))}

        <ExpandableCustomizeSourceSection
          diskSource={diskSource}
          setDiskSource={setDiskSource}
          template={template}
          withDrivers={windowsDrivers}
          setDrivers={setWindowsDrivers}
          cdSource={cdSource}
          setCDSource={setCDSource}
          relevantUpload={relevantUpload}
        />

        <ExpandableOptionsFields optionalFields={optionalFields} />

        <FormError error={error} />
        <FormActionGroup loading={!loaded} />
      </Form>
    </FormProvider>
  );
};

export default CustomizeFormWithStorage;
