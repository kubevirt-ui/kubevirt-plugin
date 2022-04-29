import React from 'react';
import { TemplateSchedulingGridProps } from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import { useDeschedulerInstalled, useDeschedulerOn } from 'src/views/templates/utils';
import { DESCHEDULER_URL } from 'src/views/templates/utils/constants';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Popover,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, PencilAltIcon } from '@patternfly/react-icons';

import DeschedulerModal from './DeschedulerModal';

import 'src/views/templates/details/tabs/scheduling/TemplateSchedulingTab.scss';

const Descheduler: React.FC<TemplateSchedulingGridProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const isDeschedulerOn = useDeschedulerOn(template);
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
        {useDeschedulerInstalled && (
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
            {isDeschedulerOn ? t('ON') : t('OFF')}
            <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
          </Button>
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default Descheduler;
