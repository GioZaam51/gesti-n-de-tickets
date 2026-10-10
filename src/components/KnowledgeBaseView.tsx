import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  ThumbsUp,
  Tag,
  Plus,
  X,
  User,
  Calendar,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { KnowledgeArticle } from '../types/ticket';

export const KnowledgeBaseView: React.FC = () => {
  const { knowledgeArticles, markArticleHelpful, addKnowledgeArticle, currentPersona } = useTickets();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [readingArticle, setReadingArticle] = useState<KnowledgeArticle | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New article form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Soporte TI');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  const categories = ['all', ...Array.from(new Set(knowledgeArticles.map((a) => a.category)))];

  const filteredArticles = knowledgeArticles.filter((art) => {
    const matchesCat = selectedCategory === 'all' || art.category === selectedCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.summary.toLowerCase().includes(search.toLowerCase()) ||
      art.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    addKnowledgeArticle({
      title: newTitle,
      category: newCategory,
      summary: newSummary || newContent.slice(0, 120) + '...',
      content: newContent,
      tags: newTags ? newTags.split(',').map((t) => t.trim()) : ['TI', 'Soporte'],
      author: currentPersona.name,
    });

    setIsAddModalOpen(false);
    setNewTitle('');
    setNewSummary('');
    setNewContent('');
    setNewTags('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-md text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Centro de Ayuda & Autoservicio
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            Base de Conocimiento & Documentación de Soporte
          </h2>
          <p className="text-xs text-slate-300">
            Encuentra soluciones inmediatas para fallos de VPN, configuraciones de correo, licencias y hardware corporativo.
          </p>

          <div className="relative mt-4">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar guías por palabra clave (ej: VPN, contraseña, monitor, phishing)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-xs bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Categories Bar & Add Button */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'all' ? 'Todas las Categorías' : cat}
            </button>
          ))}
        </div>

        {currentPersona.role !== 'customer' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar Artículo</span>
          </button>
        )}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredArticles.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No se encontraron artículos con ese criterio de búsqueda</p>
          </div>
        ) : (
          filteredArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => setReadingArticle(art)}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                  <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {art.category}
                  </span>
                  <span>Actualizado {art.updatedAt}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {art.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] font-medium">{art.author}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                    <ThumbsUp className="w-3 h-3" />
                    {art.helpfulCount} votos útiles
                  </span>

                  <span className="text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Read Article Modal */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="min-w-0 pr-4">
                <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                  {readingArticle.category}
                </span>
                <h2 className="text-base font-bold truncate text-white">
                  {readingArticle.title}
                </h2>
              </div>
              <button
                onClick={() => setReadingArticle(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center gap-4 text-xs text-slate-500 pb-3 border-b border-slate-100">
                <span>Autor: <strong className="text-slate-800">{readingArticle.author}</strong></span>
                <span>·</span>
                <span>Fecha: <strong className="text-slate-800">{readingArticle.updatedAt}</strong></span>
              </div>

              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg text-xs text-indigo-950 font-medium">
                {readingArticle.summary}
              </div>

              <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line space-y-2 pt-2">
                {readingArticle.content}
              </div>

              {/* Tags */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-medium">Etiquetas:</span>
                {readingArticle.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer with Helpful feedback button */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-600">
                ¿Te fue de ayuda esta información?
              </span>
              <button
                onClick={() => {
                  markArticleHelpful(readingArticle.id);
                  setReadingArticle((prev) =>
                    prev ? { ...prev, helpfulCount: prev.helpfulCount + 1 } : null
                  );
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Sí, me ayudó ({readingArticle.helpfulCount})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Article Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-base font-bold">Publicar Nuevo Artículo en la Base de Conocimiento</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título de la Guía
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Pasos para restablecer contraseña de correo y SSO"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Redes y Conectividad">Redes y Conectividad</option>
                    <option value="Cuentas y Accesos">Cuentas y Accesos</option>
                    <option value="Ciberseguridad">Ciberseguridad</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Software y Licencias">Software y Licencias</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Etiquetas (separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="Ej: VPN, WiFi, Red"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resumen Corto
                </label>
                <input
                  type="text"
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Breve resumen de 1 a 2 líneas para la tarjeta..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contenido Completo de la Solución
                </label>
                <textarea
                  rows={6}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Instrucciones paso a paso, capturas o comandos necesarios..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm"
                >
                  Guardar Artículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
