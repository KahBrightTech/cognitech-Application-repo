{{/*
Common labels applied to all PulseBoard resources.
*/}}
{{- define "pulseboard.labels" -}}
app: pulseboard
app.kubernetes.io/part-of: pulseboard
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- end -}}
