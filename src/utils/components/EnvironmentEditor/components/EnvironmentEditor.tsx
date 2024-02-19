import * as React from 'react';

import {
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiCoreV1Secret,
  IoK8sApiCoreV1ServiceAccount,
} from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Divider, TextInput, Tooltip } from '@patternfly/react-core';
import { Select, SelectGroup, SelectVariant } from '@patternfly/react-core/deprecated';
import { MinusCircleIcon } from '@patternfly/react-icons';

import { EnvironmentKind, MapKindToAbbr } from '../constants';
import { EnvironmentOption } from '../utils';

import EnvironmentSelectOption from './EnvironmentSelectOption';

import './EnvironmentEditor.scss';
type EnvironmentEditorProps = {
  configMaps: IoK8sApiCoreV1ConfigMap[];
  diskName: string;
  environmentName?: string;
  environmentNamesSelected: string[];
  id: number;
  kind?: EnvironmentKind;
  onChange: (diskName: string, name: string, serial: string, kind: EnvironmentKind) => void;
  onRemove?: (diskName: string) => void;
  secrets: IoK8sApiCoreV1Secret[];
  serial?: string;
  serviceAccounts: IoK8sApiCoreV1ServiceAccount[];
};

const EnvironmentEditor: React.FC<EnvironmentEditorProps> = ({
  configMaps,
  diskName,
  environmentName,
  environmentNamesSelected,
  id,
  kind,
  onChange,
  onRemove,
  secrets,
  serial,
  serviceAccounts,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setOpen] = React.useState(false);

  const onFilter = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, value: string): React.ReactElement[] => {
      const filteredSecrets = secrets
        ?.filter((secret) => secret.metadata.name.includes(value))
        ?.map((secret) => (
          <EnvironmentSelectOption
            isDisabled={environmentNamesSelected?.includes(secret.metadata.name)}
            key={secret.metadata.name}
            kind={EnvironmentKind.secret}
            name={secret.metadata.name}
          />
        ));

      const filteredConfigMaps = configMaps
        ?.filter((configMap) => configMap.metadata.name.includes(value))
        ?.map((configMap) => (
          <EnvironmentSelectOption
            isDisabled={environmentNamesSelected?.includes(configMap.metadata.name)}
            key={configMap.metadata.name}
            kind={EnvironmentKind.configMap}
            name={configMap.metadata.name}
          />
        ));

      const filteredServiceAccounts = serviceAccounts
        ?.filter((serviceAccount) => serviceAccount.metadata.name.includes(value))
        ?.map((serviceAccount) => (
          <EnvironmentSelectOption
            isDisabled={environmentNamesSelected?.includes(serviceAccount.metadata.name)}
            key={serviceAccount.metadata.name}
            kind={EnvironmentKind.serviceAccount}
            name={serviceAccount.metadata.name}
          />
        ));

      return [...filteredSecrets, ...filteredConfigMaps, ...filteredServiceAccounts];
    },
    [configMaps, environmentNamesSelected, secrets, serviceAccounts],
  );

  return (
    <div className="row pairs-list__row">
      <div className="col-xs-5 pairs-list__value-pair-field">
        <Select
          onSelect={(event, selection: EnvironmentOption) => {
            onChange(diskName, selection.getName(), serial, selection.getKind());
            setOpen(false);
          }}
          toggleIcon={
            kind ? (
              <span className={`co-m-resource-icon co-m-resource-${kind}`}>
                {MapKindToAbbr[kind]}
              </span>
            ) : null
          }
          aria-labelledby="environment-name-header"
          hasInlineFilter
          isOpen={isOpen}
          maxHeight={400}
          menuAppendTo="parent"
          onFilter={onFilter}
          onToggle={(_, isExpanded) => setOpen(isExpanded)}
          placeholderText={t('Select a resource')}
          selections={new EnvironmentOption(environmentName, kind)}
          variant={SelectVariant.single}
        >
          <SelectGroup key="group1" label={t('Secrets')}>
            {secrets.map((secret) => (
              <EnvironmentSelectOption
                isDisabled={environmentNamesSelected?.includes(secret.metadata.name)}
                key={secret.metadata.name}
                kind={EnvironmentKind.secret}
                name={secret.metadata.name}
              />
            ))}
          </SelectGroup>
          <Divider key="divider1" />
          <SelectGroup key="group2" label={t('Config Maps')}>
            {configMaps.map((configMap) => (
              <EnvironmentSelectOption
                isDisabled={environmentNamesSelected?.includes(configMap.metadata.name)}
                key={configMap.metadata.name}
                kind={EnvironmentKind.configMap}
                name={configMap.metadata.name}
              />
            ))}
          </SelectGroup>
          <Divider key="divider2" />
          <SelectGroup key="group3" label={t('Service Accounts')}>
            {serviceAccounts.map((serviceAccount) => (
              <EnvironmentSelectOption
                isDisabled={environmentNamesSelected?.includes(serviceAccount.metadata.name)}
                key={serviceAccount.metadata.name}
                kind={EnvironmentKind.serviceAccount}
                name={serviceAccount.metadata.name}
              />
            ))}
          </SelectGroup>
        </Select>
      </div>
      <div className="col-xs-5 pairs-list__name-field">
        <TextInput
          aria-labelledby="environment-serial-header"
          id={`${id}-serial`}
          onChange={(_, value) => onChange(diskName, environmentName, value, kind)}
          type="text"
          value={serial}
        />
      </div>
      <div className="col-xs-1 pairs-list__action">
        <Tooltip content={t('Remove')}>
          <Button
            className="pairs-list__span-btns"
            data-test-id="pairs-list__delete-from-btn"
            onClick={() => onRemove(diskName)}
            type="button"
            variant="plain"
          >
            <MinusCircleIcon className="pairs-list__side-btn pairs-list__delete-icon" />
            <span className="sr-only">{t('Delete')}</span>
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};
export default EnvironmentEditor;
