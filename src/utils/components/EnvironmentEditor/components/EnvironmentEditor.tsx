import * as React from 'react';

import {
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiCoreV1Secret,
  IoK8sApiCoreV1ServiceAccount,
} from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  Divider,
  Select,
  SelectGroup,
  SelectVariant,
  TextInput,
  Tooltip,
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

import { EnvironmentKind, MapKindToAbbr } from '../constants';
import { EnvironmentOption } from '../utils';

import EnvironmentSelectOption from './EnvironmentSelectOption';

import './EnvironmentEditor.scss';

type EnvironmentEditorProps = {
  secrets: IoK8sApiCoreV1Secret[];
  configMaps: IoK8sApiCoreV1ConfigMap[];
  serviceAccounts: IoK8sApiCoreV1ServiceAccount[];
  environmentName?: string;
  serial?: string;
  kind?: EnvironmentKind;
  diskName: string;
  id: number;
  onChange: (diskName: string, name: string, serial: string, kind: EnvironmentKind) => void;
  onRemove?: (diskName: string) => void;
  environmentNamesSelected: string[];
};

const EnvironmentEditor: React.FC<EnvironmentEditorProps> = ({
  secrets,
  configMaps,
  serviceAccounts,
  environmentName,
  serial,
  kind,
  diskName,
  onChange,
  onRemove,
  id,
  environmentNamesSelected,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setOpen] = React.useState(false);

  const onFilter = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, value: string): React.ReactElement[] => {
      const filteredSecrets = secrets
        ?.filter((secret) => secret.metadata.name.includes(value))
        ?.map((secret) => (
          <EnvironmentSelectOption
            key={secret.metadata.name}
            kind={EnvironmentKind.secret}
            name={secret.metadata.name}
            isDisabled={environmentNamesSelected?.includes(secret.metadata.name)}
          />
        ));

      const filteredConfigMaps = configMaps
        ?.filter((configMap) => configMap.metadata.name.includes(value))
        ?.map((configMap) => (
          <EnvironmentSelectOption
            key={configMap.metadata.name}
            kind={EnvironmentKind.configMap}
            name={configMap.metadata.name}
            isDisabled={environmentNamesSelected?.includes(configMap.metadata.name)}
          />
        ));

      const filteredServiceAccounts = serviceAccounts
        ?.filter((serviceAccount) => serviceAccount.metadata.name.includes(value))
        ?.map((serviceAccount) => (
          <EnvironmentSelectOption
            key={serviceAccount.metadata.name}
            kind={EnvironmentKind.serviceAccount}
            name={serviceAccount.metadata.name}
            isDisabled={environmentNamesSelected?.includes(serviceAccount.metadata.name)}
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
          menuAppendTo="parent"
          aria-labelledby="environment-name-header"
          isOpen={isOpen}
          onToggle={(isExpanded) => setOpen(isExpanded)}
          onSelect={(event, selection: EnvironmentOption) => {
            onChange(diskName, selection.getName(), serial, selection.getKind());
            setOpen(false);
          }}
          variant={SelectVariant.single}
          selections={new EnvironmentOption(environmentName, kind)}
          placeholderText={t('Select a resource')}
          maxHeight={400}
          onFilter={onFilter}
          hasInlineFilter
          toggleIcon={
            kind ? (
              <span className={`co-m-resource-icon co-m-resource-${kind}`}>
                {MapKindToAbbr[kind]}
              </span>
            ) : null
          }
        >
          <SelectGroup label={t('Secrets')} key="group1">
            {secrets.map((secret) => (
              <EnvironmentSelectOption
                key={secret.metadata.name}
                kind={EnvironmentKind.secret}
                name={secret.metadata.name}
                isDisabled={environmentNamesSelected?.includes(secret.metadata.name)}
              />
            ))}
          </SelectGroup>
          <Divider key="divider1" />
          <SelectGroup label={t('Config Maps')} key="group2">
            {configMaps.map((configMap) => (
              <EnvironmentSelectOption
                key={configMap.metadata.name}
                kind={EnvironmentKind.configMap}
                name={configMap.metadata.name}
                isDisabled={environmentNamesSelected?.includes(configMap.metadata.name)}
              />
            ))}
          </SelectGroup>
          <Divider key="divider2" />
          <SelectGroup label={t('Service Accounts')} key="group3">
            {serviceAccounts.map((serviceAccount) => (
              <EnvironmentSelectOption
                key={serviceAccount.metadata.name}
                kind={EnvironmentKind.serviceAccount}
                name={serviceAccount.metadata.name}
                isDisabled={environmentNamesSelected?.includes(serviceAccount.metadata.name)}
              />
            ))}
          </SelectGroup>
        </Select>
      </div>

      <div className="col-xs-5 pairs-list__name-field">
        <TextInput
          id={`${id}-serial`}
          type="text"
          value={serial}
          onChange={(value) => onChange(diskName, environmentName, value, kind)}
          aria-labelledby="environment-serial-header"
        />
      </div>
      <div className="col-xs-1 pairs-list__action">
        <Tooltip content={t('Remove')}>
          <Button
            type="button"
            data-test-id="pairs-list__delete-from-btn"
            className="pairs-list__span-btns"
            onClick={() => onRemove(diskName)}
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
