import React, { FC, ReactElement, useCallback, useState } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { K8sGroupVersionKind, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, Select, SelectOption, SelectVariant, Truncate } from '@patternfly/react-core';

type SelectResourceByNameProps = {
  className?: string;
  fieldId: string;
  isDisabled?: boolean;
  label: string;
  nameSelected: string;
  onChange: (newName: string) => void;
  placeholder: string;
  resourceGroupVersionKind: K8sGroupVersionKind;
  resourceNames: string[];
  resourcesLoaded: boolean;
};

const SelectResourceByName: FC<SelectResourceByNameProps> = ({
  className,
  fieldId,
  isDisabled,
  label,
  nameSelected,
  onChange,
  placeholder,
  resourceGroupVersionKind: resourceModel,
  resourceNames,
  resourcesLoaded,
}) => {
  const [isOpen, setSelectOpen] = useState(false);

  const onSelect = useCallback(
    (event, selection) => {
      onChange(selection);
      setSelectOpen(false);
    },
    [onChange],
  );

  const filterResources = (_, userInput: string): ReactElement[] => {
    let newOptions = resourceNames;

    if (userInput) {
      const regex = new RegExp(userInput, 'i');
      newOptions = newOptions.filter((namespace) => regex.test(namespace));
    }

    return newOptions.map((namespace) => (
      <SelectOption key={namespace} value={namespace} />
    )) as ReactElement[];
  };

  return (
    <FormGroup className={className} fieldId={fieldId} id={fieldId} isRequired label={label}>
      {resourcesLoaded ? (
        <Select
          aria-labelledby={fieldId}
          hasInlineFilter
          isDisabled={isDisabled}
          isOpen={isOpen}
          maxHeight={400}
          menuAppendTo="parent"
          onFilter={filterResources}
          onSelect={onSelect}
          onToggle={() => setSelectOpen(!isOpen)}
          placeholderText={placeholder}
          selections={nameSelected}
          variant={SelectVariant.single}
        >
          {resourceNames.map((name) => (
            <SelectOption key={name} value={name}>
              <ResourceLink groupVersionKind={resourceModel} linkTo={false}>
                <Truncate content={name} />
              </ResourceLink>
            </SelectOption>
          ))}
        </Select>
      ) : (
        <Loading />
      )}
    </FormGroup>
  );
};

export default SelectResourceByName;
