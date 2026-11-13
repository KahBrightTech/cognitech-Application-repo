{{/*
Expand the name of the chart.
*/}}
{{- define "movienight.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "movienight.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "movienight.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "movienight.labels" -}}
helm.sh/chart: {{ include "movienight.chart" . }}
{{ include "movienight.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
environment: {{ .Values.global.environment }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "movienight.selectorLabels" -}}
app.kubernetes.io/name: {{ include "movienight.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Backend labels
*/}}
{{- define "movienight.backend.labels" -}}
{{ include "movienight.labels" . }}
component: backend
{{- end }}

{{/*
Backend selector labels
*/}}
{{- define "movienight.backend.selectorLabels" -}}
{{ include "movienight.selectorLabels" . }}
component: backend
{{- end }}

{{/*
Frontend labels
*/}}
{{- define "movienight.frontend.labels" -}}
{{ include "movienight.labels" . }}
component: frontend
{{- end }}

{{/*
Frontend selector labels
*/}}
{{- define "movienight.frontend.selectorLabels" -}}
{{ include "movienight.selectorLabels" . }}
component: frontend
{{- end }}

{{/*
Backend image
*/}}
{{- define "movienight.backend.image" -}}
{{- printf "%s/%s:%s-%s" .Values.image.registry .Values.image.repository .Values.backend.image.name .Values.image.tag }}
{{- end }}

{{/*
Frontend image
*/}}
{{- define "movienight.frontend.image" -}}
{{- printf "%s/%s:%s-%s" .Values.image.registry .Values.image.repository .Values.frontend.image.name .Values.image.tag }}
{{- end }}

{{/*
Namespace
*/}}
{{- define "movienight.namespace" -}}
{{- .Values.global.namespace | default .Release.Namespace }}
{{- end }}
