/**
 * Resolve the Segment API key from Console SERVER_FLAGS.telemetry.
 * Mirrors openshift/console segment-analytics key selection.
 */
export const getTelemetryApiKey = (): string =>
  window.SERVER_FLAGS.telemetry?.SEGMENT_API_KEY ||
  window.SERVER_FLAGS.telemetry?.SEGMENT_PUBLIC_API_KEY ||
  window.SERVER_FLAGS.telemetry?.DEVSANDBOX_SEGMENT_API_KEY ||
  '';

/**
 * Whether kubevirt-plugin should initialize / use Segment analytics.
 *
 * Aligns with OpenShift Console TELEMETRY_DISABLED checks (API key + explicit
 * disable flags) and additionally requires ACCOUNT_MAIL.
 *
 * ACCOUNT_MAIL is populated from OCM subscription lookup. When that data is
 * unavailable (typical disconnected / authenticating-proxy clusters), Console
 * keeps SEGMENT_* hosts populated but leaves account fields empty. Loading
 * analytics.min.js in that state causes outbound requests to
 * console.redhat.com and proxy auth popups (CNV-98836).
 */
export const isSegmentTelemetryEnabled = (): boolean => {
  const telemetry = window.SERVER_FLAGS?.telemetry;

  if (!getTelemetryApiKey()) {
    return false;
  }

  if (
    telemetry?.DISABLED === 'true' ||
    telemetry?.DEVSANDBOX_DISABLED === 'true' ||
    telemetry?.TELEMETER_CLIENT_DISABLED === 'true'
  ) {
    return false;
  }

  // DevSandbox uses its own Segment key and does not rely on OCM ACCOUNT_MAIL.
  if (telemetry?.DEVSANDBOX === 'true') {
    return true;
  }

  // Require account email so disconnected / OCM-unavailable clusters do not
  // load analytics.min.js when only SEGMENT_* hosts remain configured.
  if (!telemetry?.ACCOUNT_MAIL) {
    return false;
  }

  return true;
};
