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
