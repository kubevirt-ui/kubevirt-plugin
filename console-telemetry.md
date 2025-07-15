# Set up Console Telemetry

To ensure the availability of Console telemetry (`window.SERVER_FLAGS.telemetry`) on local development
environment, set up `BRIDGE_TELEMETRY` environment variable before running the Console Bridge server.

```sh
# https://github.com/openshift/console-operator/blob/main/manifests/05-telemetry-config.yaml
API_HOST="console.redhat.com/connections/api/v1"
JS_HOST="console.redhat.com/connections/cdn"
PUBLIC_API_KEY="..." # Use API key from the link above

# Export BRIDGE_TELEMETRY variable, its value is a comma separated list of Console telemetry options.
export BRIDGE_TELEMETRY=\
SEGMENT_API_HOST="${API_HOST}",\
SEGMENT_JS_HOST="${JS_HOST}",\
SEGMENT_API_KEY="${PUBLIC_API_KEY}",\
DISABLED="false"
```
