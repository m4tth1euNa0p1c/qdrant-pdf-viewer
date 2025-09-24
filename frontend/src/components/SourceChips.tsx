"use client";

import { useState } from "react";

interface Source {
  label: string;
  source: string;
  score: number;
  excerpt?: string;
}

interface SourceChipsProps {
  sources: Source[];
}

function SourceTooltip({ source, children }: { source: Source; children: React.ReactNode }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!source.excerpt) {
    return <div>{children}</div>;
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10 w-64 animate-in fade-in slide-in-from-bottom-1 duration-200">
          <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-xl">
            <p className="text-xs text-white/80 leading-relaxed line-clamp-3">
              {source.excerpt}
            </p>
            <div className="w-2 h-2 bg-black/90 border-r border-b border-white/20 transform rotate-45 absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SourceChips({ sources }: SourceChipsProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleSources = showAll ? sources : sources.slice(0, 3);
  const hasMore = sources.length > 3;

  if (!sources.length) {
    return (
      <div className="text-xs px-2 py-1 rounded-lg bg-black/20 border border-white/5 text-white/40 italic">
        Aucune source trouvée
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-sm text-white/70 font-medium">Sources utilisées</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {visibleSources.map((source, i) => (
          <SourceTooltip key={i} source={source}>
            <div className="group text-xs px-2 py-1 rounded-lg bg-black/30 border border-white/10 hover:bg-black/40 hover:border-white/20 transition-all duration-150 cursor-help">
              <span className="font-medium">#{i + 1}</span>
              <span className="mx-1 text-white/40">•</span>
              <span className="text-white/80">{source.label}</span>
              <span className="mx-1 text-white/40">•</span>
              <span className="text-white/60 text-[10px]">{source.source}</span>
              <span className="ml-1 text-white/40 text-[10px]">
                ({source.score.toFixed(3)})
              </span>
            </div>
          </SourceTooltip>
        ))}

        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white/90 transition-all duration-150"
          >
            {showAll ? (
              <>
                <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Voir moins
              </>
            ) : (
              <>
                Afficher {sources.length - 3} de plus
                <svg className="w-3 h-3 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>

      {sources.length > 0 && (
        <p className="text-[11px] text-white/40 mt-2">
          💡 Survole une source pour voir un extrait du contenu
        </p>
      )}
    </div>
  );
}
