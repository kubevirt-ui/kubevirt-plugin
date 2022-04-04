import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { Form } from '@patternfly/react-core';

import { addCDToTemplate } from '../../cd';
import {
  buildFields,
  getTemplateStorageQuantity,
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
  const [customSource, setCustomSource] = React.useState<V1beta1DataVolumeSpec>();
  const [cdSource, setCDSource] = React.useState(false);

  const templateWithCDVolume = React.useMemo(() => {
    if (cdSource) return addCDToTemplate(template, customSource);
    else {
      let virtualMachine = getTemplateVirtualMachineObject(template);

      virtualMachine = overrideVirtualMachineDataVolumeSpec(virtualMachine, customSource);
      return { ...template, objects: [virtualMachine] };
    }
  }, [cdSource, template, customSource]);

  const [windowsDrivers, setWindowsDrivers] = React.useState(false);

  const [onSubmit, loaded, error] = useCustomizeFormSubmit(templateWithCDVolume, windowsDrivers);

  const [requiredFields, optionalFields] = buildFields(template);
  const nameField = getVirtualMachineNameField(template, t);

  const onDiskSourceChange = React.useCallback((newDiskSource) => {
    setCustomSource(newDiskSource);
  }, []);

  return (
    <Form onSubmit={onSubmit}>
      <FieldGroup field={nameField} showError={error} />

      {requiredFields?.map((field) => (
        <FieldGroup key={field.name} field={field} showError={error} />
      ))}

      <ExpandableCustomizeSourceSection
        onChange={onDiskSourceChange}
        initialVolumeQuantity={getTemplateStorageQuantity(template)}
        withDrivers={windowsDrivers}
        setDrivers={setWindowsDrivers}
        cdSource={cdSource}
        setCDSource={setCDSource}
      />

      <ExpandableOptionsFields optionalFields={optionalFields} />

      <FormError error={error} />
      <FormActionGroup loading={!loaded} />
    </Form>
  );
};

export default CustomizeFormWithStorage;
