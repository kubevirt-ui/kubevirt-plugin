import type { YAMLTemplate } from '@openshift-console/dynamic-plugin-sdk';
import type {
  EncodedExtension,
  ConsolePluginBuildMetadata,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  yamlTemplates: 'src/templates/index.ts',
};

export const extensions: EncodedExtension[] = [
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      model: {
        group: 'kubevirt.io',
        kind: 'VirtualMachine',
        version: 'v1',
      },
      name: 'default',
      template: {
        $codeRef: 'yamlTemplates.defaultVMYamlTemplate',
      },
    },
    type: 'console.yaml-template',
  } as EncodedExtension<YAMLTemplate>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      model: {
        group: 'template.openshift.io',
        kind: 'Template',
        version: 'v1',
      },
      name: 'default',
      template: {
        $codeRef: 'yamlTemplates.defaultVMTemplateYamlTemplate',
      },
    },
    type: 'console.yaml-template',
  } as EncodedExtension<YAMLTemplate>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      model: {
        group: 'cdi.kubevirt.io',
        kind: 'DataVolume',
        version: 'v1beta1',
      },
      name: 'default',
      template: {
        $codeRef: 'yamlTemplates.defaultBootableVolumeYamlTemplate',
      },
    },
    type: 'console.yaml-template',
  } as EncodedExtension<YAMLTemplate>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      model: {
        group: 'migrations.kubevirt.io',
        kind: 'MigrationPolicy',
        version: 'v1alpha1',
      },
      name: 'default',
      template: {
        $codeRef: 'yamlTemplates.defaultMigrationPolicyYamlTemplate',
      },
    },
    type: 'console.yaml-template',
  } as EncodedExtension<YAMLTemplate>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      model: {
        group: 'instancetype.kubevirt.io',
        kind: 'VirtualMachineClusterInstancetype',
        version: 'v1beta1',
      },
      name: 'default',
      template: {
        $codeRef: 'yamlTemplates.defaultVirtualMachineClusterInstancetypeYamlTemplate',
      },
    },
    type: 'console.yaml-template',
  } as EncodedExtension<YAMLTemplate>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      model: {
        group: 'instancetype.kubevirt.io',
        kind: 'VirtualMachineInstancetype',
        version: 'v1beta1',
      },
      name: 'default',
      template: {
        $codeRef: 'yamlTemplates.defaultVirtualMachineInstancetypeYamlTemplate',
      },
    },
    type: 'console.yaml-template',
  } as EncodedExtension<YAMLTemplate>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      model: {
        group: 'instancetype.kubevirt.io',
        kind: 'VirtualMachineClusterPreference',
        version: 'v1beta1',
      },
      name: 'default',
      template: {
        $codeRef: 'yamlTemplates.defaultVirtualMachineClusterPreferenceYamlTemplate',
      },
    },
    type: 'console.yaml-template',
  } as EncodedExtension<YAMLTemplate>,
];
