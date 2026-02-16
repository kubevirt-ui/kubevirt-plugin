import { K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';

export enum EditorType {
  Form = 'form',
  YAML = 'yaml',
}

export type FormEditorProps = {
  formData?: K8sResourceKind;
  isEdit?: boolean;
  onChange?: (data: K8sResourceKind) => void;
};

export type YAMLEditorProps = {
  initialYAML?: string;
  isEdit?: boolean;
  onChange?: (yaml: string) => void;
};
