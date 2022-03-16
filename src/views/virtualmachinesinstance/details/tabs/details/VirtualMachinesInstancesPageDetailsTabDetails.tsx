import * as React from 'react';
import { Trans } from 'react-i18next';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import OwnerReferences from '@kubevirt-utils/components/OwnerReferences/OwnerReferences';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Grid,
  GridItem,
  Label,
  LabelGroup,
  Popover,
  Title,
} from '@patternfly/react-core';
import { LinkIcon } from '@patternfly/react-icons';

type VirtualMachinesInstancesPageDetailsTabDetailsProps = {
  vmi: V1VirtualMachineInstance;
  pathname: string;
};

const VirtualMachinesInstancesPageDetailsTabDetails: React.FC<
  VirtualMachinesInstancesPageDetailsTabDetailsProps
> = ({ vmi, pathname }) => {
  const { t } = useKubevirtTranslation();

  return (
    <div>
      <a href={`${pathname}#details`} className="link-icon">
        <LinkIcon size="sm" />
      </a>
      <Title headingLevel="h2" className="co-section-heading">
        {t('Virtual Machine Instance Details')}
      </Title>
      <Grid>
        <GridItem span={6}>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTermHelpText>
                <Popover
                  hasAutoWidth
                  maxWidth="30rem"
                  headerContent={<div>{t('Name')}</div>}
                  bodyContent={
                    <Trans ns="'plugin__kubevirt-plugin'">
                      Name must be unique within a namespace. Is required when creating resources,
                      although some resources may allow a client to request the generation of an
                      appropriate name automatically. Name is primarily intended for creation
                      idempotence and configuration definition. Cannot be updated. More info:
                      <a href="http://kubernetes.io/docs/user-guide/identifiers#names">
                        {` http://kubernetes.io/docs/user-guide/identifiers#names`}
                      </a>
                      <Breadcrumb>
                        <BreadcrumbItem>VirtualMachineInstance</BreadcrumbItem>
                        <BreadcrumbItem>metadata</BreadcrumbItem>
                        <BreadcrumbItem>name</BreadcrumbItem>
                      </Breadcrumb>
                    </Trans>
                  }
                >
                  <DescriptionListTermHelpTextButton>{t('Name')}</DescriptionListTermHelpTextButton>
                </Popover>
              </DescriptionListTermHelpText>
              <DescriptionListDescription>{vmi?.metadata?.name}</DescriptionListDescription>
              <DescriptionListTermHelpText>
                <Popover
                  hasAutoWidth
                  maxWidth="30rem"
                  headerContent={<div>{t('Namespace')}</div>}
                  bodyContent={
                    <Trans ns="'plugin__kubevirt-plugin'">
                      Namespace defines the space within which each name must be unique. An empty
                      namespace is equivalent to the &quot;default&quot; namespace, but
                      &quot;default&quot; is the canonical representation. Not all objects are
                      required to be scoped to a namespace - the value of this field for those
                      objects will be empty.
                      <div>
                        {`\nMust be a DNS_LABEL. Cannot be updated. More info:`}
                        <a href="http://kubernetes.io/docs/user-guide/namespaces">
                          {` http://kubernetes.io/docs/user-guide/namespaces`}
                        </a>
                      </div>
                      <Breadcrumb>
                        <BreadcrumbItem>VirtualMachineInstance</BreadcrumbItem>
                        <BreadcrumbItem>metadata</BreadcrumbItem>
                        <BreadcrumbItem>namespace</BreadcrumbItem>
                      </Breadcrumb>
                    </Trans>
                  }
                >
                  <DescriptionListTermHelpTextButton>
                    {t('Namespace')}
                  </DescriptionListTermHelpTextButton>
                </Popover>
              </DescriptionListTermHelpText>
              <DescriptionListDescription>
                <ResourceLink kind="Namespace" name={vmi?.metadata?.namespace} />
              </DescriptionListDescription>
              <DescriptionListTermHelpText>
                <Popover
                  hasAutoWidth
                  maxWidth="30rem"
                  headerContent={<div>{t('Labels')}</div>}
                  bodyContent={
                    <Trans ns="'plugin__kubevirt-plugin'">
                      Map of string keys and values that can be used to organize and categorize
                      (scope and select) objects. May match selectors of replication controllers and
                      services.
                      <div>
                        {`\nMore info:`}
                        <a href="http://kubernetes.io/docs/user-guide/labels">
                          {` http://kubernetes.io/docs/user-guide/labels`}
                        </a>
                      </div>
                      <Breadcrumb>
                        <BreadcrumbItem>VirtualMachineInstance</BreadcrumbItem>
                        <BreadcrumbItem>metadata</BreadcrumbItem>
                        <BreadcrumbItem>labels</BreadcrumbItem>
                      </Breadcrumb>
                    </Trans>
                  }
                >
                  <DescriptionListTermHelpTextButton>
                    {t('Labels')}
                  </DescriptionListTermHelpTextButton>
                </Popover>
              </DescriptionListTermHelpText>
              <DescriptionListDescription>
                <LabelGroup>
                  {Object.entries(vmi?.metadata?.labels || {})?.map(([key, value]) => {
                    return (
                      <Label color="blue" variant="outline" key={key}>{`${key}=${value}`}</Label>
                    );
                  })}
                </LabelGroup>
              </DescriptionListDescription>
              <DescriptionListTermHelpText>
                <Popover
                  hasAutoWidth
                  maxWidth="30rem"
                  headerContent={<div>{t('Annotations')}</div>}
                  bodyContent={
                    <Trans ns="'plugin__kubevirt-plugin'">
                      Annotations is an unstructured key value map stored with a resource that may
                      be set by external tools to store and retrieve arbitrary metadata. They are
                      not queryable and should be preserved when modifying objects.
                      <div>
                        {`\nMore info:`}
                        <a href="http://kubernetes.io/docs/user-guide/annotations">
                          {` http://kubernetes.io/docs/user-guide/annotations`}
                        </a>
                      </div>
                      <Breadcrumb>
                        <BreadcrumbItem>VirtualMachineInstance</BreadcrumbItem>
                        <BreadcrumbItem>metadata</BreadcrumbItem>
                        <BreadcrumbItem>annotations</BreadcrumbItem>
                      </Breadcrumb>
                    </Trans>
                  }
                >
                  <DescriptionListTermHelpTextButton>
                    {t('Annotations')}
                  </DescriptionListTermHelpTextButton>
                </Popover>
              </DescriptionListTermHelpText>
              <DescriptionListDescription>
                <Button variant="link" isInline>
                  {t('{{count}} Annotations', {
                    count: Object.keys(vmi?.metadata?.annotations || {}).length,
                  })}
                </Button>
              </DescriptionListDescription>
              <DescriptionListTerm>{t('Description')}</DescriptionListTerm>
              <DescriptionListDescription>
                {vmi?.metadata?.labels?.description || t('Not available')}
              </DescriptionListDescription>
              <DescriptionListTerm>{t('Operation System')}</DescriptionListTerm>
              <DescriptionListDescription>operation system</DescriptionListDescription>{' '}
              <DescriptionListTermHelpText>
                <Popover
                  hasAutoWidth
                  maxWidth="30rem"
                  headerContent={<div>{t('Created At')}</div>}
                  bodyContent={
                    <Trans ns="'plugin__kubevirt-plugin'">
                      CreationTimestamp is a timestamp representing the server time when this object
                      was created. It is not guaranteed to be set in happens-before order across
                      separate operations. Clients may not set this value. It is represented in
                      RFC3339 form and is in UTC. Populated by the system. Read-only. Null for
                      lists.
                      <div>
                        {`\nMore info:`}
                        <a href="https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata">
                          {` https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata`}
                        </a>
                      </div>
                      <Breadcrumb>
                        <BreadcrumbItem>VirtualMachineInstance</BreadcrumbItem>
                        <BreadcrumbItem>metadata</BreadcrumbItem>
                        <BreadcrumbItem>creationTimestamp</BreadcrumbItem>
                      </Breadcrumb>
                    </Trans>
                  }
                >
                  <DescriptionListTermHelpTextButton>
                    {t('Created At')}
                  </DescriptionListTermHelpTextButton>
                </Popover>
              </DescriptionListTermHelpText>
              <DescriptionListDescription>created at</DescriptionListDescription>
              <DescriptionListTermHelpText>
                <Popover
                  hasAutoWidth
                  maxWidth="30rem"
                  headerContent={<div>{t('Owner')}</div>}
                  bodyContent={
                    <Trans ns="'plugin__kubevirt-plugin'">
                      List of objects depended by this object. If ALL objects in the list have been
                      deleted, this object will be garbage collected. If this object is managed by a
                      controller, then an entry in this list will point to this controller, with the
                      controller field set to true. There cannot be more than one managing
                      controller.
                      <Breadcrumb>
                        <BreadcrumbItem>VirtualMachineInstance</BreadcrumbItem>
                        <BreadcrumbItem>metadata</BreadcrumbItem>
                        <BreadcrumbItem>ownerReferences</BreadcrumbItem>
                      </Breadcrumb>
                    </Trans>
                  }
                >
                  <DescriptionListTermHelpTextButton>
                    {t('Owner')}
                  </DescriptionListTermHelpTextButton>
                </Popover>
              </DescriptionListTermHelpText>
              <DescriptionListDescription>
                <OwnerReferences obj={vmi} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </GridItem>
        <GridItem span={6}>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
              <DescriptionListDescription>status</DescriptionListDescription>
              <DescriptionListTerm>{t('Pod')}</DescriptionListTerm>
              <DescriptionListDescription>pod</DescriptionListDescription>
              <DescriptionListTerm>{t('Boot Order')}</DescriptionListTerm>
              <DescriptionListDescription>boot order</DescriptionListDescription>
              <DescriptionListTerm>{t('IP Address')}</DescriptionListTerm>
              <DescriptionListDescription>ip address</DescriptionListDescription>
              <DescriptionListTerm>{t('Hostname')}</DescriptionListTerm>
              <DescriptionListDescription>hostname</DescriptionListDescription>
              <DescriptionListTerm>{t('Time Zone')}</DescriptionListTerm>
              <DescriptionListDescription>time zone</DescriptionListDescription>
              <DescriptionListTerm>{t('Node')}</DescriptionListTerm>
              <DescriptionListDescription>node</DescriptionListDescription>
              <DescriptionListTerm>{t('Workload Profile')}</DescriptionListTerm>
              <DescriptionListDescription>workload profile</DescriptionListDescription>
              <DescriptionListTerm>{t('User Credentials')}</DescriptionListTerm>
              <DescriptionListDescription>user creds</DescriptionListDescription>
              <DescriptionListTerm>{t('SSH Access')}</DescriptionListTerm>
              <DescriptionListDescription>ssh access</DescriptionListDescription>
              <DescriptionListTerm>{t('Hardware devices')}</DescriptionListTerm>
              <DescriptionListDescription>hardware devices</DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </GridItem>
      </Grid>
    </div>
  );
};

export default VirtualMachinesInstancesPageDetailsTabDetails;
