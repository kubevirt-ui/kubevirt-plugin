import React, { FC, ReactNode, useCallback, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Alert,
  AlertActionCloseButton,
  AlertVariant,
  Button,
  ButtonVariant,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Flex,
  FlexItem,
} from '@patternfly/react-core';

import { removeMetadataKey } from '../../details/utils/utils';

import KeyValueTable from './KeyValueTable';
import MetadataEmptyState from './MetadataEmptyState';

type MetadataSectionProps = {
  addButtonLabel: string;
  canUpdate: boolean;
  'data-test': string;
  emptyText: string;
  helpText: string;
  metadataType: 'annotations' | 'labels';
  onClickValue?: (key: string, value: string) => void;
  onEdit: () => void;
  onToggleAdvanced: () => void;
  searchId: string;
  systemCount: number;
  systemLinkLabel: string;
  title: string;
  userData: Record<string, string>;
  valueRenderer?: (key: string, value: string) => ReactNode;
  vm: V1VirtualMachine;
};

const MetadataSection: FC<MetadataSectionProps> = ({
  addButtonLabel,
  canUpdate,
  'data-test': dataTest,
  emptyText,
  helpText,
  metadataType,
  onClickValue,
  onEdit,
  onToggleAdvanced,
  searchId,
  systemCount,
  systemLinkLabel,
  title,
  userData,
  valueRenderer,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const hasData = !isEmpty(Object.keys(userData));
  const [deletingKey, setDeletingKey] = useState<null | string>(null);
  const [deleteError, setDeleteError] = useState<null | string>(null);
  const [keyToDelete, setKeyToDelete] = useState<null | string>(null);

  const onDeleteConfirm = useCallback(async () => {
    if (!keyToDelete) return;
    setDeletingKey(keyToDelete);
    setDeleteError(null);
    try {
      await removeMetadataKey(vm, keyToDelete, metadataType);
    } catch (err) {
      setDeleteError(
        t('Failed to remove {{key}}: {{error}}', { error: err?.message, key: keyToDelete }),
      );
    } finally {
      setDeletingKey(null);
      setKeyToDelete(null);
    }
  }, [vm, metadataType, keyToDelete, t]);

  return (
    <Card data-test={dataTest}>
      <CardHeader>
        <CardTitle>
          <SearchItem id={searchId}>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              spaceItems={{ default: 'spaceItemsSm' }}
            >
              <FlexItem>{title}</FlexItem>
              <FlexItem>
                <HelpTextIcon bodyContent={helpText} />
              </FlexItem>
            </Flex>
          </SearchItem>
        </CardTitle>
      </CardHeader>
      <CardBody>
        {deleteError && (
          <Alert
            actionClose={<AlertActionCloseButton onClose={() => setDeleteError(null)} />}
            className="pf-v6-u-mb-md"
            isInline
            title={deleteError}
            variant={AlertVariant.danger}
          />
        )}
        {hasData ? (
          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
            {canUpdate && (
              <FlexItem>
                <Button
                  data-test={`${dataTest}-add-btn`}
                  onClick={onEdit}
                  variant={ButtonVariant.secondary}
                >
                  {addButtonLabel}
                </Button>
              </FlexItem>
            )}
            <FlexItem>
              <KeyValueTable
                data={userData}
                data-test={`${dataTest}-table`}
                deletingKey={deletingKey}
                onClickValue={onClickValue}
                onDelete={canUpdate ? setKeyToDelete : undefined}
                valueRenderer={valueRenderer}
              />
            </FlexItem>
          </Flex>
        ) : (
          <MetadataEmptyState
            addButtonLabel={addButtonLabel}
            canUpdate={canUpdate}
            data-test={dataTest}
            emptyText={emptyText}
            onEdit={onEdit}
            onToggleAdvanced={onToggleAdvanced}
            systemCount={systemCount}
            systemLinkLabel={systemLinkLabel}
          />
        )}
      </CardBody>
      <TabModal
        headerText={t('Delete {{type}}?', {
          type: metadataType === 'labels' ? t('label') : t('annotation'),
        })}
        isOpen={!!keyToDelete}
        onClose={() => setKeyToDelete(null)}
        onSubmit={onDeleteConfirm}
        submitBtnText={t('Delete')}
        submitBtnVariant={ButtonVariant.danger}
        titleIconVariant="warning"
      >
        {t('Are you sure you want to delete {{type}} {{key}}={{value}}?', {
          key: keyToDelete,
          type: metadataType === 'labels' ? t('label') : t('annotation'),
          value: keyToDelete ? userData[keyToDelete] : '',
        })}
      </TabModal>
    </Card>
  );
};

export default MetadataSection;
