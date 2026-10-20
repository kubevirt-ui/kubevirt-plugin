/**
 * Gallery stub for console status icon components (`lib/app/components/status/icons`).
 * Renders nothing so scenes do not depend on console icon assets.
 */
import type { ReactNode } from 'react';

type StatusIconProps = { title?: string };

const statusIconStub = (_props: StatusIconProps): ReactNode => null;

export const BlueInfoCircleIcon = statusIconStub;

export const RedExclamationCircleIcon = statusIconStub;

export const GreenCheckCircleIcon = statusIconStub;

export const YellowExclamationTriangleIcon = statusIconStub;

export const GrayUnknownIcon = statusIconStub;
