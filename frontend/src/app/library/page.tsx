"use client";

import { FileText, FolderOpen, Search, Shield, Upload, Zap } from "lucide-react";

import DragDropUploader from "@/components/DragDropUploader";
import PdfList from "@/components/PdfList";

export default function LibraryPage() {
  return (
    <div className="min-h-[calc(100vh-200px)]">

      <div className="grid lg:grid-cols-12 gap-8">
        <section className="lg:col-span-5">
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-600/10 backdrop-blur-sm border border-purple-500/20 rounded-3xl shadow-2xl p-6 lg:p-8 h-fit">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Upload size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Ajouter un PDF</h2>
                <p className="text-white/60 text-sm">
                  Enrichissez votre base de connaissances
                </p>
              </div>
            </div>

            <div className="bg-black/20 rounded-2xl p-6 mb-6">
              <DragDropUploader />
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" />
                Processus d'ingestion
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 border border-blue-500/40 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-blue-300 font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-white/90 font-medium">Extraction du texte</p>
                    <p className="text-white/60">Analyse complète du contenu PDF</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500/20 border border-purple-500/40 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-purple-300 font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-white/90 font-medium">Découpage intelligent</p>
                    <p className="text-white/60">Segmentation en chunks contextuels</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-green-300 font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-white/90 font-medium">Création d'embeddings</p>
                    <p className="text-white/60">Vectorisation pour la recherche</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500/20 border border-orange-500/40 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-orange-300 font-bold">4</span>
                  </div>
                  <div>
                    <p className="text-white/90 font-medium">Indexation Qdrant</p>
                    <p className="text-white/60">Stockage dans la base vectorielle</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-7">
          <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-3xl shadow-2xl p-6 lg:p-8 min-h-[70vh]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <FolderOpen size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Mes Documents</h2>
                <p className="text-white/60 text-sm">
                  Gérez et organisez votre bibliothèque
                </p>
              </div>
            </div>

            <div className="bg-black/20 rounded-2xl p-1">
              <PdfList />
            </div>
          </div>
        </section>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
              <Search size={16} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Recherche Vectorielle</h3>
          </div>
          <p className="text-white/70 text-sm">
            Technologie Qdrant pour une recherche sémantique avancée dans vos documents.
          </p>
        </div>

        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Support PDF</h3>
          </div>
          <p className="text-white/70 text-sm">
            Extraction intelligente du texte avec préservation de la structure et du contexte.
          </p>
        </div>

        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Sécurisé</h3>
          </div>
          <p className="text-white/70 text-sm">
            Vos documents restent privés et sécurisés dans votre infrastructure locale.
          </p>
        </div>
      </div>
    </div>
  );
}
