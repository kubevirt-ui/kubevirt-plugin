import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Form } from '@patternfly/react-core';

import { addCDToTemplate } from '../../cd';
import { buildFields, getTemplateStorageQuantity, getVirtualMachineNameField } from '../../utils';
import { ExpandableCustomizeSourceSection } from '../CustomizeSource/ExpandableCustomizeSourceSection';
import { ExpandableOptionsFields } from '../ExpandableOptionalFields';
import { FieldGroup } from '../FieldGroup';
import { FormActionGroup } from '../FormActionGroup';

import { SelectCDSourceLabel } from './SelectCDSourceLabel';
import { useCustomizeFormSubmit } from './useCustomizeFormSubmit';

type CustomizeFormWithCDProps = {
  template: V1Template;
};

export const CustomizeFormWithCD: React.FC<CustomizeFormWithCDProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const [customCDSource, setCustomCDSource] = React.useState<V1beta1DataVolumeSpec>();

  const templateWithCDVolume = React.useMemo(
    () => addCDToTemplate(template, customCDSource),
    [template, customCDSource],
  );

  const [onSubmit, loaded, error] = useCustomizeFormSubmit(templateWithCDVolume);

  const [requiredFields, optionalFields] = buildFields(template);
  const nameField = getVirtualMachineNameField(template, t);

  const onDiskSourceChange = React.useCallback((newDiskSource) => {
    setCustomCDSource(newDiskSource);
  }, []);

  return (
    <Form onSubmit={onSubmit}>
      <FieldGroup field={nameField} showError={error} />

      <ExpandableCustomizeSourceSection
        onChange={onDiskSourceChange}
        initialVolumeQuantity={getTemplateStorageQuantity(template)}
        sourceLabel={<SelectCDSourceLabel />}
      />

      {requiredFields?.map((field) => (
        <FieldGroup key={field.name} field={field} showError={error} />
      ))}

      <ExpandableOptionsFields optionalFields={optionalFields} />

      <FormActionGroup loading={!loaded} />
    </Form>
  );
};
