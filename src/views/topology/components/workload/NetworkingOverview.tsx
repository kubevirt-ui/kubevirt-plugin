import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceLink, SidebarSectionHeading } from '@console/internal/components/hooks';
import { RouteLocation } from '@console/internal/components/routes';
import { K8sResourceKind, RouteKind } from '@console/internal/module/k8s';
import { useRoutesWatcher, useServicesWatcher } from '@console/shared';
import { LongArrowAltRightIcon } from '@patternfly/react-icons';

const ServicePortList: React.FC<ServicePortListProps> = ({ service }) => {
  const ports = service.spec?.ports ?? [];
  const { t } = useTranslation();
  return (
    <ul className="port-list">
      {ports.map(({ name, port, protocol, targetPort }) => (
        <li key={name || `${protocol}/${port}`}>
          <span className="text-muted">{t('kubevirt-plugin~Service port:')}</span>{' '}
          {name || `${protocol}/${port}`}
          &nbsp;
          <LongArrowAltRightIcon />
          &nbsp;
          <span className="text-muted">{t('kubevirt-plugin~Pod port:')}</span> {targetPort}
        </li>
      ))}
    </ul>
  );
};

const ServicesOverviewListItem: React.FC<ServiceOverviewListItemProps> = ({ service }) => {
  const { name, namespace } = service.metadata;
  return (
    <li className="list-group-item">
      <ResourceLink kind="Service" name={name} namespace={namespace} />
      <ServicePortList service={service} />
    </li>
  );
};

const ServicesOverviewList: React.FC<ServiceOverviewListProps> = ({ services }) => (
  <ul className="list-group">
    {services?.map((service) => (
      <ServicesOverviewListItem key={service.metadata.uid} service={service} />
    ))}
  </ul>
);

const RoutesOverviewListItem: React.FC<RoutesOverviewListItemProps> = ({ route }) => {
  const { name, namespace } = route.metadata;
  const { t } = useTranslation();
  return (
    <li className="list-group-item">
      <ResourceLink kind="Route" name={name} namespace={namespace} />
      <span className="text-muted">{t('kubevirt-plugin~Location:')}</span>
      <RouteLocation obj={route} />
    </li>
  );
};

const RoutesOverviewList: React.FC<RoutesOverviewListProps> = ({ routes }) => (
  <ul className="list-group">
    {routes?.map((route) => (
      <RoutesOverviewListItem key={route.metadata.uid} route={route} />
    ))}
  </ul>
);

export const NetworkingOverview: React.FC<NetworkingOverviewProps> = ({ obj }) => {
  const { t } = useTranslation();
  const serviceResources = useServicesWatcher(obj);
  const services =
    serviceResources.loaded && !serviceResources.loadError ? serviceResources.services : [];
  const routeResources = useRoutesWatcher(obj);
  const routes = routeResources.loaded && !routeResources.loadError ? routeResources.routes : [];
  return (
    <>
      <SidebarSectionHeading text={t('kubevirt-plugin~Services')} />
      {!(services?.length > 0) ? (
        <span className="text-muted">
          {t('kubevirt-plugin~No Services found for this resource.')}
        </span>
      ) : (
        <ServicesOverviewList services={services} />
      )}

      <SidebarSectionHeading text={t('kubevirt-plugin~Routes')} />
      {!(routes?.length > 0) ? (
        <span className="text-muted">
          {t('kubevirt-plugin~No Routes found for this resource.')}
        </span>
      ) : (
        <RoutesOverviewList routes={routes} />
      )}
    </>
  );
};

type RoutesOverviewListProps = {
  routes: RouteKind[];
};

type RoutesOverviewListItemProps = {
  route: RouteKind;
};

type NetworkingOverviewProps = {
  obj: K8sResourceKind;
};

type ServicePortListProps = {
  service: K8sResourceKind;
};

type ServiceOverviewListProps = {
  services: K8sResourceKind[];
};

type ServiceOverviewListItemProps = {
  service: K8sResourceKind;
};
