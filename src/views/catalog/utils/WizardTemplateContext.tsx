import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { getTemplateVirtualMachineObject } from './vm-template-source/utils';

type WizardTemplateContextType = {
  /** the template used for the wizard */
  template?: V1Template;
  /**
   * used to update the context template.
   * @param template V1Template
   */
  updateTemplate?: (template: V1Template) => void;
  /** loading state of the template */
  loaded?: boolean;
  /** error state of the template */
  error?: any;
};

export const WizardTemplateContext = React.createContext<WizardTemplateContextType>({});

export const useWizardTemplate = (): WizardTemplateContextType => {
  const [template, setTemplate] = React.useState<V1Template>();
  const [loaded, setLoaded] = React.useState<boolean>(true);
  const [error, setError] = React.useState<any>();

  const updateTemplate = (updatedTemplate: V1Template) => {
    setLoaded(false);
    setError(undefined);

    // simulate a vm creation to validate the template
    k8sCreate<V1VirtualMachine>({
      model: VirtualMachineModel,
      data: getTemplateVirtualMachineObject(updatedTemplate),
      queryParams: {
        dryRun: 'All',
      },
    })
      .then(() => {
        setTemplate(updatedTemplate);
        setLoaded(true);
      })
      .catch((err) => {
        setError(err);
        setLoaded(true);
      });
  };

  return {
    template,
    updateTemplate,
    loaded,
    error,
  };
};

export const WizardTemplateContextProvider: React.FC = ({ children }) => {
  const context = useWizardTemplate();
  return (
    <WizardTemplateContext.Provider value={context}>{children}</WizardTemplateContext.Provider>
  );
};

export const useWizardTemplateContext = () => React.useContext(WizardTemplateContext);
