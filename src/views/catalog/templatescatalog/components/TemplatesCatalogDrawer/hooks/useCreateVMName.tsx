import { useState } from 'react';

import { NAME_INPUT_FIELD } from '@catalog/templatescatalog/utils/consts';
import { generateVMName } from '@kubevirt-utils/resources/template';

import {
  changeTemplateParameterValue,
  getTemplateNameParameterValue,
  hasNameParameter,
} from '../utils';

import { useDrawerContext } from './useDrawerContext';

const useCreateVMName = () => {
  const { setTemplate, template } = useDrawerContext();

  const nameParameterExists = hasNameParameter(template);
  const [vmName, setVMName] = useState(generateVMName(template));

  const nameField = nameParameterExists ? getTemplateNameParameterValue(template) : vmName;

  const onVMNameChange = (newName: string) => {
    nameParameterExists
      ? setTemplate((draftTemplate) =>
          changeTemplateParameterValue(draftTemplate, NAME_INPUT_FIELD, newName),
        )
      : setVMName(vmName);
  };

  return { nameField, onVMNameChange };
};

export default useCreateVMName;
