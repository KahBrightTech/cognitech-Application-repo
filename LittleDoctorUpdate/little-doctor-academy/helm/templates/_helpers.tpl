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
Name of the SecretProviderClass used when Cognito values are sourced from
AWS Secrets Manager through the Secrets Store CSI driver.
*/}}
{{- define "littledoctor.cognitoSecretProviderClassName" -}}
{{- .Values.cognito.secretManager.secretProviderClassName | default (printf "%s-cognito" .Values.frontend.name) -}}
{{- end -}}

{{/*
ServiceAccount name used by the frontend pod.
*/}}
{{- define "littledoctor.serviceAccountName" -}}
{{- if .Values.frontend.serviceAccount.create -}}
{{- .Values.frontend.serviceAccount.name | default .Values.frontend.name -}}
{{- else -}}
{{- required "frontend.serviceAccount.name is required when frontend.serviceAccount.create=false" .Values.frontend.serviceAccount.name -}}
{{- end -}}
{{- end -}}
