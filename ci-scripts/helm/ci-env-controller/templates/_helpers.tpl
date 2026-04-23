{{/*
Common labels applied to every resource.
*/}}
{{- define "ci-env-controller.labels" -}}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
app.kubernetes.io/component: ci-env-controller
{{- end }}
