interface Props {
  message: string | null;
}

export function AuditProgress({ message }: Props) {
  return (
    <div className="audit-progress" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span className="audit-progress-message">{message ?? "Iniciando auditoria..."}</span>
    </div>
  );
}
