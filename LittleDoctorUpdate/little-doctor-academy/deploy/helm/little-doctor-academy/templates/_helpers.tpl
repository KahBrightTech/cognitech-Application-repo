{{- define "little-doctor-academy.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "little-doctor-academy.fullname" -}}
{{- printf "%s-%s" .Release.Name (include "little-doctor-academy.name" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "little-doctor-academy.labels" -}}
app.kubernetes.io/name: {{ include "little-doctor-academy.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "little-doctor-academy.cognitoSecretName" -}}
{{- .Values.cognito.existingSecret | default (printf "%s-cognito" (include "little-doctor-academy.fullname" .)) }}
{{- end }}
