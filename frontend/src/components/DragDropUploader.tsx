"use client";
import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
import { apiUpload } from "@/lib/api";
import { CloudUpload } from "lucide-react";
import clsx from "clsx";

export default function DragDropUploader() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onDrop = useCallback(async (files: File[]) => {
    const pdf = files[0];
    if (!pdf) return;
    if (pdf.type !== "application/pdf") {
      setMsg("Seuls les PDF sont acceptés.");
      return;
    }
    try {
      setLoading(true);
      setMsg("Upload et ingestion en cours…");
      await apiUpload(pdf);
      setMsg("✅ Upload terminé. Rafraîchis la liste à droite.");
    } catch (e: any) {
      setMsg(`❌ ${e.message || "Échec upload"}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "application/pdf": [".pdf"] },
  });

  return (
    <div
      {...getRootProps()}
      className={clsx(
        "border-2 border-dashed rounded-2xl p-8 text-center transition",
        "cursor-pointer hover:bg-white/5",
        isDragActive ? "border-white/40 bg-white/5" : "border-white/15"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        <CloudUpload className="text-white/70" />
        <p className="text-white/80">Glisse ton PDF ici ou clique pour sélectionner</p>
        <p className="text-xs text-white/50">Uniquement .pdf</p>
        {loading && <p className="text-sm text-white/70 animate-pulse mt-2">Traitement…</p>}
        {msg && <p className="text-sm text-white/70 mt-2">{msg}</p>}
      </div>
    </div>
  );
}
