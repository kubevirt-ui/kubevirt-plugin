import React from 'react';
import { isDeschedulerOn, useDeschedulerInstalled } from 'src/views/templates/utils';
import { DESCHEDULER_URL } from 'src/views/templates/utils/constants';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { V1Template } from '@kubevirt-utils/models';
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Popover,
  Tooltip,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, PencilAltIcon } from '@patternfly/react-icons';

import DeschedulerModal from './DeschedulerModal';

import 'src/views/templates/details/tabs/scheduling/TemplateSchedulingTab.scss';

type DeschedulerProps = {
  template: V1Template;
};

const Descheduler: React.FC<DeschedulerProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const isDeschedulerInstalled = useDeschedulerInstalled();

  return (
    <DescriptionListGroup>
      <DescriptionListTermHelpText>
        <Popover
          hasAutoWidth
          maxWidth="30rem"
          headerContent={t('Descheduler')}
          bodyContent={
            <>
              {t(
                'The descheduler can be used to evict a running VM so that the VM can be rescheduled onto a more suitable node via a live migration.',
              )}
              <div className="margin-top">
                <Button
                  variant="link"
                  icon={<ExternalLinkAltIcon />}
                  href={DESCHEDULER_URL}
                  target="_blank"
                  component="a"
                  iconPosition="right"
                  className="no-left-padding"
                >
                  {t('Learn more')}
                </Button>
              </div>
            </>
          }
        >
          <DescriptionListTermHelpTextButton>{t('Descheduler')}</DescriptionListTermHelpTextButton>
        </Popover>
      </DescriptionListTermHelpText>

      <DescriptionListDescription>
        <Tooltip
          content={
            !isDeschedulerInstalled &&
            t(
              'To enable the descheduler, you must install the Kube Descheduler Operator from OperatorHub and enable one or more descheduler profiles.',
            )
          }
          position="right"
        >
          <span>
            <Button
              isInline
              isDisabled={!isDeschedulerInstalled}
              onClick={() =>
                createModal(({ isOpen, onClose }) => (
                  <DeschedulerModal template={template} isOpen={isOpen} onClose={onClose} />
                ))
              }
              variant="link"
              iconPosition={'right'}
            >
              {isDeschedulerInstalled && isDeschedulerOn(template) ? t('ON') : t('OFF')}
              {isDeschedulerInstalled && (
                <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
              )}
            </Button>
          </span>
        </Tooltip>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default Descheduler;
