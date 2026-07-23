import { useState, type FormEvent } from "react";

interface Props {
  onSubmit: (url: string) => void;
  loading: boolean;
}

export function AuditForm({ onSubmit, loading }: Props) {
  const [url, setUrl] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (url.trim()) onSubmit(url.trim());
  }

  return (
    <form className="audit-form" onSubmit={handleSubmit}>
      <input
        type="url"
        required
        placeholder="https://ejemplo.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Auditando..." : "Auditar"}
      </button>
    </form>
  );
}
