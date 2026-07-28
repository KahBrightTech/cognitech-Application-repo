{{/*
Common labels applied to all LittleDoctor resources.
*/}}
{{- define "littledoctor.labels" -}}
app: {{ .Values.global.appLabel }}
app.kubernetes.io/part-of: {{ .Values.global.appLabel }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- end -}}

{{/*
Name of the Secret holding the Cognito pool/client config consumed by the
frontend container. Uses cognito.existingSecret when set (a Secret managed
outside this chart), otherwise falls back to the Secret this chart creates
in secret.yaml.
*/}}
{{- define "littledoctor.cognitoSecretName" -}}
{{- .Values.cognito.existingSecret | default (printf "%s-cognito" .Values.frontend.name) -}}
{{- end -}}

{{/*
ServiceAccount name used by the frontend pod.
*/}}
{{- define "littledoctor.serviceAccountName" -}}
{{- .Values.frontend.serviceAccount.name | default .Values.frontend.name -}}
{{- end -}}
