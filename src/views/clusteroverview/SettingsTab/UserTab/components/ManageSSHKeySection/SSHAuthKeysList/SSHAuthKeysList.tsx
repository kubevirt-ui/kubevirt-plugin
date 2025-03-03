import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Button,
  Content,
  ContentVariants,
  Grid,
  GridItem,
  Panel,
  PanelMain,
  Skeleton,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import SSHAuthKeyRow from './components/SSHAuthKeyRow/SSHAuthKeyRow';
import useSSHAuthKeys from './hooks/useSSHAuthKeys';

import './SSHAuthKeysList.scss';

const SSHAuthKeysList: FC = () => {
  const { t } = useKubevirtTranslation();
  const {
    authKeyRows,
    loaded,
    onAuthKeyAdd,
    onAuthKeyChange,
    onAuthKeyDelete,
    selectableProjects,
  } = useSSHAuthKeys();

  if (!loaded) return <Skeleton />;

  return (
    <>
      <Panel isScrollable>
        <PanelMain maxHeight="12.25rem">
          <Grid>
            <GridItem span={5}>
              <Content component={ContentVariants.h6}>{t('Project')}</Content>
            </GridItem>
            <GridItem span={1} />
            <GridItem span={5}>
              <Content component={ContentVariants.h6}>{t('Public SSH key')}</Content>
            </GridItem>
          </Grid>
          {authKeyRows?.map((row) => (
            <SSHAuthKeyRow
              isRemoveDisabled={authKeyRows.length === 1 && isEmpty(row.projectName)}
              key={row.id}
              onAuthKeyChange={onAuthKeyChange}
              onAuthKeyDelete={onAuthKeyDelete}
              row={row}
              selectableProjects={selectableProjects}
            />
          ))}
        </PanelMain>
      </Panel>
      <Button
        className="add-row-btn"
        icon={<PlusCircleIcon />}
        isDisabled={isEmpty(selectableProjects)}
        isInline
        onClick={onAuthKeyAdd}
        variant="link"
      >
        {t('Add public SSH key to project')}
      </Button>
    </>
  );
};

export default SSHAuthKeysList;
