{{/*
Common labels applied to all LittleDoctor resources.
*/}}
{{- define "littledoctor.labels" -}}
app: {{ .Values.global.appLabel }}
app.kubernetes.io/part-of: {{ .Values.global.appLabel }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- end -}}
