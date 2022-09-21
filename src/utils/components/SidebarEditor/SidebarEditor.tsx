import React, { ReactNode, Suspense, useContext, useMemo, useState } from 'react';
import { dump } from 'js-yaml';

import { K8sResourceCommon, YAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertActionCloseButton,
  AlertVariant,
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  Sidebar,
  SidebarContent,
  SidebarPanel,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import Loading from '../Loading/Loading';

import { SidebarEditorContext } from './SidebarEditorContext';
import { safeLoad } from './utils';

import './sidebar-editor.scss';

type SidebarEditorProps<Resource> = {
  resource: Resource;
  onResourceUpdate?: (newResource: Resource) => Promise<Resource | void>;
  children: ReactNode | ReactNode[] | ((resource: Resource) => ReactNode);
  onChange?: (resource: Resource) => void;
};

const SidebarEditor = <Resource extends K8sResourceCommon>({
  children,
  resource,
  onResourceUpdate,
  onChange,
}: SidebarEditorProps<Resource>): JSX.Element => {
  const [editableYAML, setEditableYAML] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const resourceYAML = useMemo(() => {
    const yaml = dump(resource, { skipInvalid: true });
    setEditableYAML(yaml);
    return yaml;
  }, [resource]);

  const { showEditor, isEditable } = useContext(SidebarEditorContext);
  const editedResource = safeLoad<Resource>(editableYAML);

  const changeResource = (newValue: string) => {
    setEditableYAML(newValue);

    if (onChange) onChange(safeLoad<Resource>(newValue));
    return {};
  };

  const onUpdate = (newResource: Resource) => {
    if (!onResourceUpdate) return;

    setSuccess(false);
    setError(null);
    setLoading(true);
    return onResourceUpdate(newResource)
      .then(() => setSuccess(true))
      .catch(setError)
      .finally(() => setLoading(false));
  };

  const onReload = () => {
    setSuccess(false);
    setError(null);
    setEditableYAML(resourceYAML);
  };

  return (
    <Sidebar isPanelRight hasGutter hasNoBackground className="sidebar-editor">
      <SidebarContent>
        {children instanceof Function ? children(editedResource ?? resource) : children}
      </SidebarContent>
      {showEditor && (
        <SidebarPanel
          width={{ default: 'width_33', lg: 'width_50', xl: 'width_50' }}
          className="sidebar-editor__panel"
        >
          <Stack hasGutter>
            <StackItem isFilled>
              <Suspense fallback={<Loading />}>
                <YAMLEditor
                  value={editableYAML}
                  minHeight="300px"
                  onChange={changeResource}
                  onSave={() => onUpdate(editedResource)}
                  options={{ readOnly: !isEditable }}
                />
              </Suspense>
            </StackItem>
            {(success || error) && (
              <StackItem>
                {success && (
                  <Alert
                    title="Success"
                    variant={AlertVariant.success}
                    actionClose={<AlertActionCloseButton onClose={() => setSuccess(false)} />}
                  ></Alert>
                )}
                {error && (
                  <Alert title="Error" variant={AlertVariant.danger}>
                    {error.message}
                  </Alert>
                )}
              </StackItem>
            )}
            {onResourceUpdate && isEditable && (
              <StackItem>
                <Flex>
                  <FlexItem>
                    <Button
                      variant={ButtonVariant.primary}
                      onClick={() => onUpdate(editedResource)}
                      isLoading={loading}
                      className="save-button"
                    >
                      Save
                    </Button>
                  </FlexItem>
                  <FlexItem>
                    <Button
                      variant={ButtonVariant.secondary}
                      onClick={onReload}
                      className="reload-button"
                    >
                      Reload
                    </Button>
                  </FlexItem>
                </Flex>
              </StackItem>
            )}
          </Stack>
        </SidebarPanel>
      )}
    </Sidebar>
  );
};

export default SidebarEditor;
