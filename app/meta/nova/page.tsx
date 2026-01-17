'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getCurrentGroup, clearAuth } from '@/lib/auth';
import { metasApi } from '@/lib/api';
import { TipoMeta, StatusMetaGrande } from '@/lib/types';

export default function NovaMetaPage() {
  const router = useRouter();
  const [tipo, setTipo] = useState<TipoMeta>('Profissional');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [dataPrazo, setDataPrazo] = useState('');
  const [status, setStatus] = useState<StatusMetaGrande>('ativa');
  const [metasPequenas, setMetasPequenas] = useState<Array<{ id: string; titulo: string }>>([
    { id: Math.random().toString(), titulo: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    const group = getCurrentGroup();
    if (!user || !group) {
      router.push('/login');
    }
  }, [router]);

  const handleAddMetaPequena = () => {
    setMetasPequenas([...metasPequenas, { id: Math.random().toString(), titulo: '' }]);
  };

  const handleRemoveMetaPequena = (id: string) => {
    if (metasPequenas.length > 1) {
      setMetasPequenas(metasPequenas.filter((m) => m.id !== id));
    }
  };

  const handleMetaPequenaChange = (id: string, titulo: string) => {
    setMetasPequenas(metasPequenas.map((m) => (m.id === id ? { ...m, titulo } : m)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = getCurrentUser();
    const group = getCurrentGroup();
    
    if (!user || !group || !titulo.trim()) return;

    setLoading(true);
    setErro('');

    try {
      await metasApi.store({
        tipo,
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        status,
        dataInicio,
        dataPrazo: dataPrazo || undefined,
        grupoId: group.id,
        metasPequenas: metasPequenas
          .filter((m) => m.titulo.trim())
          .map((m) => ({ titulo: m.titulo.trim() })),
      });
      router.push('/quadro');
    } catch (error: any) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        clearAuth();
        router.push('/login');
      } else {
        setErro(error.message || 'Erro ao criar meta');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.push('/quadro')}
            className="text-gray-400 hover:text-white"
          >
            ← Voltar
          </button>
        </div>
        
        <h1 className="mb-8 text-3xl font-bold text-white">Nova Meta Grande</h1>

        {erro && (
          <div className="mb-4 rounded-md bg-red-900/30 border border-red-800 p-3 text-sm text-red-400">{erro}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gray-800 bg-[#1a1a1a] p-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-300">Tipo de Meta</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoMeta)}
              className="mt-1 block w-full rounded-md border border-gray-700 bg-[#242424] px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="Profissional">Profissional</option>
              <option value="Pessoal">Pessoal</option>
              <option value="Estudos">Estudos</option>
              <option value="Saúde">Saúde</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-700 bg-[#242424] px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              placeholder="Ex: Portfólio GitHub com 10 projetos"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Descrição (opcional)</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-700 bg-[#242424] px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              placeholder="Descrição detalhada da meta..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Data de Início</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-700 bg-[#242424] px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Prazo Final (opcional)</label>
              <input
                type="date"
                value={dataPrazo}
                onChange={(e) => setDataPrazo(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-700 bg-[#242424] px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusMetaGrande)}
              className="mt-1 block w-full rounded-md border border-gray-700 bg-[#242424] px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="ativa">Ativa</option>
              <option value="pausada">Pausada</option>
              <option value="concluída">Concluída</option>
            </select>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">Metas Pequenas</label>
              <button
                type="button"
                onClick={handleAddMetaPequena}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                + Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {metasPequenas.map((meta, index) => (
                <div key={meta.id} className="flex gap-2">
                  <input
                    type="text"
                    value={meta.titulo}
                    onChange={(e) => handleMetaPequenaChange(meta.id, e.target.value)}
                    className="flex-1 rounded-md border border-gray-700 bg-[#242424] px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    placeholder={`Meta pequena ${index + 1}`}
                  />
                  {metasPequenas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMetaPequena(meta.id)}
                      className="rounded-md bg-red-900/30 border border-red-800 px-3 py-2 text-red-400 hover:bg-red-900/50"
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando...' : 'Criar Meta'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/quadro')}
              className="rounded-md border border-gray-700 px-4 py-2 text-gray-300 hover:bg-[#242424]"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
