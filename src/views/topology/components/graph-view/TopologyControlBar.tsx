import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  action,
  createTopologyControlButtons,
  defaultControlButtonsOptions,
  observer,
  TopologyControlBar as PfTopologyControlBar,
  Visualization,
} from '@patternfly/react-topology';

import './TopologyControlBar.scss';

interface ControlBarProps {
  visualization: Visualization;
  isDisabled: boolean;
}

const TopologyControlBar: React.FC<ControlBarProps> = observer(({ visualization, isDisabled }) => {
  const { t } = useTranslation();
  return (
    <span className="pf-topology-control-bar odc-topology-control-bar">
      <PfTopologyControlBar
        controlButtons={[
          ...createTopologyControlButtons({
            ...defaultControlButtonsOptions,
            zoomInCallback: action(() => {
              visualization.getGraph().scaleBy(4 / 3);
            }),
            zoomInTip: t('kubevirt-plugin~Zoom in'),
            zoomInAriaLabel: t('kubevirt-plugin~Zoom in'),
            zoomInDisabled: isDisabled,
            zoomOutCallback: action(() => {
              visualization.getGraph().scaleBy(0.75);
            }),
            zoomOutTip: t('kubevirt-plugin~Zoom out'),
            zoomOutAriaLabel: t('kubevirt-plugin~Zoom out'),
            zoomOutDisabled: isDisabled,
            fitToScreenCallback: action(() => {
              visualization.getGraph().fit(80);
            }),
            fitToScreenTip: t('kubevirt-plugin~Fit to screen'),
            fitToScreenAriaLabel: t('kubevirt-plugin~Fit to screen'),
            fitToScreenDisabled: isDisabled,
            resetViewCallback: action(() => {
              visualization.getGraph().reset();
              visualization.getGraph().layout();
            }),
            resetViewTip: t('kubevirt-plugin~Reset view'),
            resetViewAriaLabel: t('kubevirt-plugin~Reset view'),
            resetViewDisabled: isDisabled,
            legend: false,
          }),
        ]}
      />
    </span>
  );
});

export default TopologyControlBar;
