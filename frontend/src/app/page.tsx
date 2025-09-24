"use client";

import { Lightbulb, MessageSquare, Zap } from "lucide-react";

import ChatPanel from "@/components/ChatPanel";

export default function Page() {
  const suggestQuestions = [
    {
      text: "De quoi parle ce PDF ? Résume en 5 points.",
      icon: "📄",
      category: "Résumé"
    },
    {
      text: "Quelles sont les informations clés à retenir ?",
      icon: "📋",
      category: "Détails"
    },
    {
      text: "Explique le-moi ce concept comme si j'avais 5 ans.",
      icon: "✨",
      category: "Guide"
    }
  ];

  const fillInput = (text: string) => {
    const input = document.querySelector('input[placeholder="Pose ta question…"]') as HTMLInputElement;
    if (input) {
      input.value = text;
      input.focus();
      // Trigger input event to update React state
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)]">

      <div className="grid lg:grid-cols-12 gap-8">
        <section className="lg:col-span-8 xl:col-span-9">
          <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-3xl shadow-2xl p-6 lg:p-8 min-h-[70vh]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <MessageSquare size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Chat PDF</h2>
                <p className="text-white/60 text-sm">
                  Posez vos questions sur vos documents PDF
                </p>
              </div>
            </div>
            <ChatPanel />
          </div>
        </section>

        <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 backdrop-blur-sm border border-blue-500/20 rounded-3xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Lightbulb size={16} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Conseils</h3>
            </div>
            <div className="space-y-3">
              {suggestQuestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => fillInput(suggestion.text)}
                  className="group w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">{suggestion.icon}</span>
                    <div className="flex-1">
                      <div className="text-xs text-white/50 mb-1 uppercase tracking-wide">
                        {suggestion.category}
                      </div>
                      <p className="text-sm text-white/80 group-hover:text-white transition-colors leading-relaxed">
                        "{suggestion.text}"
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
