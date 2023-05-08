import { createElement } from 'react';
import { TFunction } from 'react-i18next';
import classNames from 'classnames';

import {
  CronJobModel,
  DaemonSetModel,
  JobModel,
  PodModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ChartLabel } from '@patternfly/react-charts';

import { K8sResourceKind } from '../../../../../clusteroverview/utils/types';
import { getPodStatus } from '../../../pod-utils';
import { HorizontalPodAutoscalerKind } from '../../../types/hpaTypes';
import { AllPodStatus, ExtPodKind } from '../../../types/podTypes';

import { PodRingLabelData, RevisionModel } from './types';

const isPendingPods = (
  pods: ExtPodKind[],
  currentPodCount: number,
  desiredPodCount: number,
): boolean =>
  (pods?.length === 1 && pods[0].status?.phase === 'Pending') ||
  (!currentPodCount && !!desiredPodCount);

export const getFailedPods = (pods: ExtPodKind[]): number => {
  if (!pods?.length) {
    return 0;
  }

  return pods.reduce((acc, currValue) => {
    if ([AllPodStatus.CrashLoopBackOff, AllPodStatus.Failed].includes(getPodStatus(currValue))) {
      return acc + 1;
    }
    return acc;
  }, 0);
};

const podKindString = (count: number) => (count === 1 ? t('Pod') : t('Pods'));

const getTitleAndSubtitle = (
  isPending: boolean,
  currentPodCount: number,
  desiredPodCount: number,
  tFunc: TFunction,
) => {
  let titlePhrase;
  let subTitlePhrase = '';
  let longTitle = false;
  let longSubtitle = false;

  // handles the initial state when the first pod is coming up and the state for no pods (scaled to zero)
  if (!currentPodCount) {
    titlePhrase = isPending ? '0' : tFunc('kubevirt-plugin~Scaled to 0');
    longTitle = !isPending;
    if (desiredPodCount) {
      subTitlePhrase = tFunc('kubevirt-plugin~Scaling to {{podSubTitle}}', {
        podSubTitle: desiredPodCount,
      });
      longSubtitle = true;
    }
  }

  // handles the idle state or scaling to the desired no. of pods
  if (currentPodCount) {
    titlePhrase = currentPodCount.toString();
    if (currentPodCount === desiredPodCount) {
      subTitlePhrase = podKindString(currentPodCount);
    } else {
      subTitlePhrase = tFunc('kubevirt-plugin~Scaling to {{podSubTitle}}', {
        podSubTitle: desiredPodCount,
      });
      longSubtitle = true;
    }
  }

  return { title: titlePhrase, longTitle, subTitle: subTitlePhrase, longSubtitle };
};

export const podRingLabel = (
  obj: K8sResourceKind,
  ownerKind: string,
  pods: ExtPodKind[],
  tFunc: TFunction,
): PodRingLabelData => {
  let currentPodCount;
  let desiredPodCount;
  let isPending;
  let titleData;
  const podRingLabelData: PodRingLabelData = {
    title: '',
    subTitle: '',
    longTitle: false,
    longSubtitle: false,
    reversed: false,
  };

  const failedPodCount = getFailedPods(pods);
  switch (ownerKind) {
    case DaemonSetModel.kind:
      currentPodCount = (obj.status?.currentNumberScheduled || 0) + failedPodCount;
      desiredPodCount = obj.status?.desiredNumberScheduled;
      desiredPodCount = obj.status?.desiredNumberScheduled;
      isPending = isPendingPods(pods, currentPodCount, desiredPodCount);
      titleData = getTitleAndSubtitle(isPending, currentPodCount, desiredPodCount, tFunc);
      podRingLabelData.title = titleData.title;
      podRingLabelData.subTitle = titleData.subTitle;
      podRingLabelData.longSubtitle = titleData.longSubtitle;
      break;
    case RevisionModel.kind:
      currentPodCount = (obj.status?.readyReplicas || 0) + failedPodCount;
      desiredPodCount = obj.spec?.replicas;
      isPending = isPendingPods(pods, currentPodCount, desiredPodCount);
      if (!isPending && !desiredPodCount) {
        podRingLabelData.title = tFunc('kubevirt-plugin~Autoscaled');
        podRingLabelData.subTitle = tFunc('kubevirt-plugin~to 0');
        podRingLabelData.reversed = true;
        break;
      }
      if (isPending) {
        podRingLabelData.title = '0';
        podRingLabelData.subTitle = tFunc('kubevirt-plugin~Scaling to {{podSubTitle}}', {
          podSubTitle: desiredPodCount,
        });
      } else {
        podRingLabelData.title = currentPodCount;
        podRingLabelData.subTitle = podKindString(currentPodCount);
      }
      break;
    case PodModel.kind:
    case JobModel.kind:
      podRingLabelData.title = '1';
      podRingLabelData.subTitle = PodModel.label;
      break;
    case CronJobModel.kind:
      podRingLabelData.title = `${pods.length}`;
      podRingLabelData.subTitle = podKindString(currentPodCount);
      break;
    default:
      currentPodCount = (obj.status?.readyReplicas || 0) + failedPodCount;
      desiredPodCount = obj.spec?.replicas;
      isPending = isPendingPods(pods, currentPodCount, desiredPodCount);
      titleData = getTitleAndSubtitle(isPending, currentPodCount, desiredPodCount, tFunc);
      podRingLabelData.title = titleData.title;
      podRingLabelData.subTitle = titleData.subTitle;
      podRingLabelData.longTitle = titleData.longTitle;
      podRingLabelData.longSubtitle = titleData.longSubtitle;
      break;
  }

  return podRingLabelData;
};

export const hpaPodRingLabel = (
  obj: K8sResourceKind,
  hpa: HorizontalPodAutoscalerKind,
  pods: ExtPodKind[],
  tFunc: TFunction,
): PodRingLabelData => {
  const desiredPodCount = obj.spec?.replicas;
  const desiredPods = hpa.status?.desiredReplicas || desiredPodCount;
  const currentPods = hpa.status?.currentReplicas;
  const scaling =
    (!currentPods && !!desiredPods) || !pods?.every((p) => p.status?.phase === 'Running');
  return {
    title: scaling ? tFunc('kubevirt-plugin~Autoscaling') : tFunc('kubevirt-plugin~Autoscaled'),
    subTitle: tFunc('kubevirt-plugin~to {{count}} Pod', { count: desiredPods }),
    longTitle: false,
    longSubtitle: false,
    reversed: true,
  };
};

export const getTitleComponent = (longTitle = false, longSubtitle = false, reversed = false) => {
  const labelClasses = classNames('pf-chart-donut-title', {
    'pod-ring__center-text--reversed': reversed,
    'pod-ring__center-text': !reversed,
    'pod-ring__long-text': longTitle,
  });
  return createElement(ChartLabel, {
    dy: longSubtitle ? -5 : 0,
    style: { lineHeight: '11px' },
    className: labelClasses,
  });
};
