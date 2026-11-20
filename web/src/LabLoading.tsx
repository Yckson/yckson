import type { Language } from "./catalog";

export function LabLoading({ language }: { language: Language }) {
  return <div className="lab-loading" role="status">
    <span className="loading-panel">
      <span className="loading-crt" aria-hidden="true">›_</span>
      {language === "pt" ? "Abrindo o laboratório…" : "Opening the lab…"}
      <span className="loading-track" aria-hidden="true" />
    </span>
  </div>;
}
