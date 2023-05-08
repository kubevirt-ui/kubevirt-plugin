import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect, Dispatch } from 'react-redux';

import { setActiveApplication } from '@console/internal/actions/ui';
import { getActiveApplication, getActiveNamespace } from '@console/internal/reducers/ui';
import { RootState } from '@console/internal/redux';
import {
  ALL_APPLICATIONS_KEY,
  ALL_NAMESPACES_KEY,
  APPLICATION_LOCAL_STORAGE_KEY,
  APPLICATION_USERSETTINGS_PREFIX,
  UNASSIGNED_APPLICATIONS_KEY,
} from '@console/shared';

import ApplicationDropdown from './ApplicationDropdown';

interface NamespaceBarApplicationSelectorProps {
  disabled?: boolean;
}

interface StateProps {
  namespace: string;
  application: string;
}

interface DispatchProps {
  onChange: (name: string) => void;
}

type Props = NamespaceBarApplicationSelectorProps & StateProps & DispatchProps;

const NamespaceBarApplicationSelector: React.FC<Props> = ({
  namespace,
  application,
  onChange,
  disabled,
}) => {
  const { t } = useTranslation();
  const allApplicationsTitle = t('kubevirt-plugin~All applications');
  const noApplicationsTitle = t('kubevirt-plugin~No application group');
  const dropdownTitle: string =
    application === ALL_APPLICATIONS_KEY
      ? allApplicationsTitle
      : application === UNASSIGNED_APPLICATIONS_KEY
      ? noApplicationsTitle
      : application;
  const [title, setTitle] = React.useState<string>(dropdownTitle);
  React.useEffect(() => {
    if (!disabled) {
      setTitle(dropdownTitle);
    }
  }, [disabled, dropdownTitle]);
  if (namespace === ALL_NAMESPACES_KEY) return null;

  const onApplicationChange = (newApplication: string, key: string) => {
    key === ALL_APPLICATIONS_KEY ? onChange(key) : onChange(newApplication);
  };

  return (
    <ApplicationDropdown
      className="co-namespace-selector"
      buttonClassName="pf-m-plain"
      namespace={namespace}
      title={title && <span className="btn-link__title">{title}</span>}
      titlePrefix={t('kubevirt-plugin~Application')}
      allSelectorItem={{
        allSelectorKey: ALL_APPLICATIONS_KEY,
        allSelectorTitle: allApplicationsTitle,
      }}
      noneSelectorItem={{
        noneSelectorKey: UNASSIGNED_APPLICATIONS_KEY,
        noneSelectorTitle: noApplicationsTitle,
      }}
      selectedKey={application || ALL_APPLICATIONS_KEY}
      onChange={onApplicationChange}
      userSettingsPrefix={APPLICATION_USERSETTINGS_PREFIX}
      storageKey={APPLICATION_LOCAL_STORAGE_KEY}
      disabled={disabled}
    />
  );
};

const mapStateToProps = (state: RootState): StateProps => ({
  namespace: getActiveNamespace(state),
  application: getActiveApplication(state),
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  onChange: (app: string) => {
    dispatch(setActiveApplication(app));
  },
});

export default connect<StateProps, DispatchProps, NamespaceBarApplicationSelectorProps>(
  mapStateToProps,
  mapDispatchToProps,
)(NamespaceBarApplicationSelector);
