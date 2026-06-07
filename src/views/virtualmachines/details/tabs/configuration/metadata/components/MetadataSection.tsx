import React, { FC, useCallback, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { Labels } from '@kubevirt-utils/components/MetadataModal/utils/utils';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
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

import DeleteMetadataModal from './DeleteMetadataModal';
import KeyValueTable from './KeyValueTable';
import MetadataEmptyState from './MetadataEmptyState';

type MetadataSectionProps = {
  canUpdate: boolean;
  helpText: string;
  metadataType: 'annotations' | 'labels';
  onClickValue?: (key: string, value: string) => void;
  onEdit: () => void;
  onShowAdvancedView: () => void;
  systemCount: number;
  userData: Labels;
  vm: V1VirtualMachine;
};

const MetadataSection: FC<MetadataSectionProps> = ({
  canUpdate,
  helpText,
  metadataType,
  onClickValue,
  onEdit,
  onShowAdvancedView,
  systemCount,
  userData,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const hasData = !isEmpty(userData);
  const [keyToDelete, setKeyToDelete] = useState<null | string>(null);

  const isLabels = metadataType === 'labels';
  const title = isLabels ? t('Labels') : t('Annotations');
  const addButtonLabel = isLabels ? t('Add label') : t('Add annotation');

  const onDeleteConfirm = useCallback(async () => {
    await removeMetadataKey(vm, keyToDelete!, metadataType);
  }, [vm, metadataType, keyToDelete]);

  return (
    <Card data-test={metadataType}>
      <CardHeader>
        <CardTitle>
          <SearchItem id={metadataType}>
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
        {hasData ? (
          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
            {canUpdate && (
              <FlexItem>
                <Button
                  data-test={`${metadataType}-add-btn`}
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
                data-test={`${metadataType}-table`}
                onClickValue={onClickValue}
                onDelete={canUpdate ? setKeyToDelete : undefined}
              />
            </FlexItem>
          </Flex>
        ) : (
          <MetadataEmptyState
            canUpdate={canUpdate}
            metadataType={metadataType}
            onEdit={onEdit}
            onShowAdvancedView={onShowAdvancedView}
            systemCount={systemCount}
          />
        )}
      </CardBody>
      <DeleteMetadataModal
        keyToDelete={keyToDelete}
        metadataType={metadataType}
        onClose={() => setKeyToDelete(null)}
        onSubmit={onDeleteConfirm}
        value={keyToDelete ? userData[keyToDelete] : ''}
      />
    </Card>
  );
};

export default MetadataSection;
