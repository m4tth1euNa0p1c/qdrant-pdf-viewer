"use client";
import { useEffect, useState } from "react";
import { apiListDocs, apiDeleteDoc } from "@/lib/api";
import { Trash2, RefreshCw } from "lucide-react";

export default function PdfList() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const d = await apiListDocs();
      window.dispatchEvent(new Event("chat:clear"));
      setDocs(d);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: number) => {
    if (!confirm("Supprimer ce document et ses embeddings ?")) return;
    await apiDeleteDoc(id);
    load();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/70">{docs.length} document(s)</span>
        <button onClick={load} className="text-sm px-3 py-1.5 rounded-lg border border-white/15 hover:bg-white/5 flex items-center gap-1">
          <RefreshCw size={14}/> Rafraîchir
        </button>
      </div>
      {loading && <div className="text-white/60">Chargement…</div>}
      {!loading && docs.length === 0 && (
        <div className="text-white/60 text-sm">Aucun document pour l’instant.</div>
      )}
      {docs.map((d) => (
        <div key={d.id} className="flex items-center justify-between bg-black/20 border border-white/10 rounded-xl p-3">
          <div>
            <div className="font-medium">{d.original_name}</div>
            <div className="text-xs text-white/60">
              Pages: {d.pages} • {Math.round(d.bytes_size / 1024)} KB • Ajouté: {new Date(d.created_at).toLocaleString()}
            </div>
          </div>
          <button
            onClick={() => remove(d.id)}
            className="px-3 py-2 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10 flex items-center gap-1"
          >
            <Trash2 size={14}/> Supprimer
          </button>
        </div>
      ))}
    </div>
  );
}
