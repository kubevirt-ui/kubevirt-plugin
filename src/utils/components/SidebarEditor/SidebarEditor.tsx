import React, { ReactNode, Suspense, useContext, useMemo, useState } from 'react';
import { dump } from 'js-yaml';

import { K8sResourceCommon, YAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import {
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
  children: (resource: Resource) => ReactNode;
};

const SidebarEditor = <Resource extends K8sResourceCommon>({
  children,
  resource,
  onResourceUpdate,
}: SidebarEditorProps<Resource>): JSX.Element => {
  const [editableYAML, setEditableYAML] = useState('');
  const resourceYAML = useMemo(() => {
    const yaml = dump(resource, { skipInvalid: true });
    setEditableYAML(yaml);
    return yaml;
  }, [resource]);

  const { showEditor } = useContext(SidebarEditorContext);
  const editedResource = safeLoad<Resource>(editableYAML);

  const changeResource = (newValue: string) => {
    setEditableYAML(newValue);

    return {};
  };

  return (
    <Sidebar isPanelRight hasGutter hasNoBackground className="sidebar-editor">
      <SidebarContent>{children && children(editedResource ?? resource)}</SidebarContent>
      {showEditor && (
        <SidebarPanel
          width={{ default: 'width_33', lg: 'width_50', xl: 'width_50' }}
          className="sidebar-editor"
        >
          <Stack hasGutter>
            <StackItem isFilled>
              <Suspense fallback={<Loading />}>
                <YAMLEditor
                  value={editableYAML}
                  minHeight="300px"
                  onChange={changeResource}
                  onSave={() => onResourceUpdate(editedResource)}
                />
              </Suspense>
            </StackItem>
            <StackItem>
              <Flex>
                <FlexItem>
                  <Button
                    variant={ButtonVariant.primary}
                    onClick={() => onResourceUpdate(editedResource)}
                  >
                    Save
                  </Button>
                </FlexItem>
                <FlexItem>
                  <Button
                    variant={ButtonVariant.secondary}
                    onClick={() => setEditableYAML(resourceYAML)}
                  >
                    Reload
                  </Button>
                </FlexItem>
              </Flex>
            </StackItem>
          </Stack>
        </SidebarPanel>
      )}
    </Sidebar>
  );
};

export default SidebarEditor;
