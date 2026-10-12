{{/*
Common labels applied to every resource.
*/}}
{{- define "ci-test-stack.labels" -}}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
ci.kubevirt-plugin/component: ci-test-stack
{{- end }}

{{/*
Plugin resource name.
*/}}
{{- define "ci-test-stack.pluginName" -}}
{{ .Release.Name }}-plugin
{{- end }}

{{/*
Console resource name.
*/}}
{{- define "ci-test-stack.consoleName" -}}
{{ .Release.Name }}-console
{{- end }}

{{/*
In-cluster URL the console uses to reach the plugin Service.
*/}}
{{- define "ci-test-stack.pluginUrl" -}}
http://{{ include "ci-test-stack.pluginName" . }}.{{ .Release.Namespace }}.svc.cluster.local:{{ .Values.plugin.port }}
{{- end }}

{{/*
OAuthClient name (cluster-scoped, so it's release-namespaced to avoid
collisions between manual-console and any concurrent E2E test releases).
*/}}
{{- define "ci-test-stack.oauthClientName" -}}
{{ .Release.Name }}-console-oauth-client
{{- end }}

{{/*
Test-runner RoleBinding name (namespace-scoped, so it's release-namespaced
to avoid a Helm ownership conflict between concurrent releases sharing one
namespace, e.g. multiple manual-console instances).
*/}}
{{- define "ci-test-stack.testRunnerRoleBindingName" -}}
{{ .Release.Name }}-ci-env-test-runner
{{- end }}

{{/*
NOTE: there is deliberately no "oauthClientSecret" helper here. A helper
that falls back to a random value (e.g. randAlphaNum) when no existing
OAuthClient/Secret is found would re-evaluate that randomness independently
each time it's `include`d, diverging between the OAuthClient and the Secret
that must both carry the identical value on a fresh install. See
console-oauthclient.yaml, which computes the secret once as a local
variable and emits both resources from that single render pass instead.
*/}}
