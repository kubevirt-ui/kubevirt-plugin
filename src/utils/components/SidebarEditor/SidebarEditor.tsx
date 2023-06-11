import React, { ReactNode, Suspense, useContext, useMemo, useState } from 'react';
import { dump } from 'js-yaml';

import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
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
import { useEditorHighlighter } from './useEditorHighlighter';
import { safeLoad } from './utils';

import './sidebar-editor.scss';

type SidebarEditorProps<Resource> = {
  children: ((resource: Resource) => ReactNode) | ReactNode | ReactNode[];
  onChange?: (resource: Resource) => void;
  onResourceUpdate?: (newResource: Resource) => Promise<Resource | void>;
  pathsToHighlight?: string[];
  resource: Resource;
};

const SidebarEditor = <Resource extends K8sResourceCommon>({
  children,
  onChange,
  onResourceUpdate,
  pathsToHighlight = PATHS_TO_HIGHLIGHT.DEFAULT,
  resource,
}: SidebarEditorProps<Resource>): JSX.Element => {
  const [editableYAML, setEditableYAML] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const resourceYAML = useMemo(() => {
    const yaml = dump(resource, { forceQuotes: true, skipInvalid: true });
    setEditableYAML(yaml);
    return yaml;
  }, [resource]);

  const { isEditable, showEditor } = useContext(SidebarEditorContext);
  const editedResource = safeLoad<Resource>(editableYAML);
  const editorRef = useEditorHighlighter(editableYAML, pathsToHighlight, showEditor);

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
    <Sidebar className="sidebar-editor" hasGutter hasNoBackground isPanelRight>
      <SidebarContent>
        {children instanceof Function ? children(editedResource ?? resource) : children}
      </SidebarContent>
      {showEditor && (
        <SidebarPanel
          className="sidebar-editor__panel"
          width={{ default: 'width_33', lg: 'width_50', xl: 'width_50' }}
        >
          <Stack hasGutter>
            <StackItem isFilled>
              <Suspense fallback={<Loading />}>
                <YAMLEditor
                  minHeight="300px"
                  onChange={changeResource}
                  onSave={() => onUpdate(editedResource)}
                  options={{ readOnly: !isEditable }}
                  ref={editorRef}
                  value={editableYAML}
                />
              </Suspense>
            </StackItem>
            {(success || error) && (
              <StackItem>
                {success && (
                  <Alert
                    actionClose={<AlertActionCloseButton onClose={() => setSuccess(false)} />}
                    title="Success"
                    variant={AlertVariant.success}
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
                      className="save-button"
                      isLoading={loading}
                      onClick={() => onUpdate(editedResource)}
                      variant={ButtonVariant.primary}
                    >
                      Save
                    </Button>
                  </FlexItem>
                  <FlexItem>
                    <Button
                      className="reload-button"
                      onClick={onReload}
                      variant={ButtonVariant.secondary}
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
