import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Form } from '@patternfly/react-core';

import { buildFields, getTemplateStorageQuantity, getVirtualMachineNameField } from '../../utils';
import { ExpandableCustomizeSourceSection } from '../CustomizeSource/ExpandableCustomizeSourceSection';
import { ExpandableOptionsFields } from '../ExpandableOptionalFields';
import { FieldGroup } from '../FieldGroup';
import { FormActionGroup } from '../FormActionGroup';

import { useCustomizeFormSubmit } from './useCustomizeFormSubmit';

type CustomizeFormWithDiskProps = {
  template: V1Template;
};

export const CustomizeFormWithDisk: React.FC<CustomizeFormWithDiskProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const [customDiskSource, setCustomDiskSource] = React.useState<V1beta1DataVolumeSpec>();
  const [onSubmit, loaded, error] = useCustomizeFormSubmit(template, customDiskSource);

  const [requiredFields, optionalFields] = buildFields(template);
  const nameField = getVirtualMachineNameField(template, t);

  const onDiskSourceChange = React.useCallback((newDiskSource) => {
    setCustomDiskSource(newDiskSource);
  }, []);

  return (
    <Form onSubmit={onSubmit}>
      <FieldGroup field={nameField} showError={error} />

      <ExpandableCustomizeSourceSection
        onChange={onDiskSourceChange}
        initialVolumeQuantity={getTemplateStorageQuantity(template)}
      />

      {requiredFields?.map((field) => (
        <FieldGroup key={field.name} field={field} showError={error} />
      ))}

      <ExpandableOptionsFields optionalFields={optionalFields} />

      <FormActionGroup loading={!loaded} />
    </Form>
  );
};
