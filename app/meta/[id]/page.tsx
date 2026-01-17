'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCurrentUser, getCurrentGroup, clearAuth } from '@/lib/auth';
import { metasApi, MetaGrandeResponse } from '@/lib/api';
import { TipoMeta, StatusMetaGrande, MetaPequena } from '@/lib/types';
import { calcularProgresso, obterCorTipo } from '@/lib/utils';
import BarraProgresso from '@/components/BarraProgresso';

export default function DetalheMetaPage() {
  const router = useRouter();
  const params = useParams();
  const metaId = params.id as string;

  const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null);
  const [meta, setMeta] = useState<MetaGrandeResponse | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');

  // Estados para edição
  const [tipo, setTipo] = useState<TipoMeta>('Profissional');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataPrazo, setDataPrazo] = useState('');
  const [status, setStatus] = useState<StatusMetaGrande>('ativa');
  const [metasPequenas, setMetasPequenas] = useState<MetaPequena[]>([]);

  useEffect(() => {
    loadMeta();
  }, [metaId]);

  const loadMeta = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }

      const currentGroup = getCurrentGroup();
      if (!currentGroup) {
        router.push('/grupos');
        return;
      }

      setUser(currentUser);

      const metaData = await metasApi.show(metaId);
      setMeta(metaData);
      setTipo(metaData.tipo as TipoMeta);
      setTitulo(metaData.titulo);
      setDescricao(metaData.descricao || '');
      setDataInicio(metaData.dataInicio.split('T')[0]);
      setDataPrazo(metaData.dataPrazo?.split('T')[0] || '');
      setStatus(metaData.status as StatusMetaGrande);
      setMetasPequenas(metaData.metasPequenas.map((mp) => ({
        id: mp.id,
        titulo: mp.titulo,
        status: mp.status,
      })));
    } catch (error: any) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        clearAuth();
        router.push('/login');
      } else {
        setErro('Erro ao carregar meta');
        router.push('/quadro');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMetaPequena = async (id: string) => {
    if (!user || !meta || meta.userId !== user.id) return;

    try {
      const metaPequena = metasPequenas.find((m) => m.id === id);
      if (!metaPequena) return;

      const novoStatus = metaPequena.status === 'concluída' ? 'pendente' : 'concluída';
      await metasApi.updateMetaPequena(metaId, id, { status: novoStatus });

      const atualizadas = metasPequenas.map((m) =>
        m.id === id ? { ...m, status: novoStatus } : m
      );
      setMetasPequenas(atualizadas as MetaPequena[]);

      // Recarregar a meta para ter os dados atualizados
      const metaAtualizada = await metasApi.show(metaId);
      setMeta(metaAtualizada);
    } catch (error: any) {
      setErro(error.message || 'Erro ao atualizar meta pequena');
    }
  };

  const handleAddMetaPequena = async () => {
    if (!meta) return;

    try {
      setErro('');
      // Criar uma meta pequena temporária para mostrar no UI
      const tempId = `temp-${Date.now()}`;
      const nova: MetaPequena = {
        id: tempId,
        titulo: '',
        status: 'pendente',
      };
      setMetasPequenas([...metasPequenas, nova]);
    } catch (error: any) {
      setErro(error.message || 'Erro ao adicionar meta pequena');
    }
  };

  const handleRemoveMetaPequena = async (id: string) => {
    if (!meta || metasPequenas.length <= 1) return;

    // Se for uma meta temporária, apenas remover do estado
    if (id.startsWith('temp-')) {
      setMetasPequenas(metasPequenas.filter((m) => m.id !== id));
      return;
    }

    try {
      setErro('');
      await metasApi.deleteMetaPequena(metaId, id);
      setMetasPequenas(metasPequenas.filter((m) => m.id !== id));
    } catch (error: any) {
      setErro(error.message || 'Erro ao remover meta pequena');
    }
  };

  const handleMetaPequenaChange = (id: string, titulo: string) => {
    const atualizadas = metasPequenas.map((m) => (m.id === id ? { ...m, titulo } : m));
    setMetasPequenas(atualizadas);
  };

  const handleSave = async () => {
    if (!meta || !titulo.trim()) return;

    setSaving(true);
    setErro('');

    try {
      // Primeiro salvar a meta grande
      await metasApi.update(metaId, {
        tipo,
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        status,
        dataInicio,
        dataPrazo: dataPrazo || undefined,
        metasPequenas: metasPequenas
          .filter((m) => m.titulo.trim())
          .map((m) => ({
            id: m.id.startsWith('temp-') ? undefined : m.id,
            titulo: m.titulo.trim(),
            status: m.status,
          })),
      });

      // Recarregar a meta
      await loadMeta();
      setIsEditMode(false);
    } catch (error: any) {
      setErro(error.message || 'Erro ao salvar meta');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!meta || !confirm('Tem certeza que deseja excluir esta meta?')) return;

    try {
      setErro('');
      await metasApi.destroy(metaId);
      router.push('/quadro');
    } catch (error: any) {
      setErro(error.message || 'Erro ao excluir meta');
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] text-white">Carregando...</div>;
  }

  if (!user || !meta) {
    return <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] text-white">Redirecionando...</div>;
  }

  const isOwner = meta.userId === user.id;
  const progresso = calcularProgresso(meta as any);
  const concluidas = metasPequenas.filter((m) => m.status === 'concluída').length;
  const total = metasPequenas.length;

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/quadro')}
            className="text-gray-400 hover:text-white"
          >
            ← Voltar
          </button>
          {isOwner && !isEditMode && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditMode(true)}
                className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
              >
                Editar
              </button>
              <button
                onClick={handleDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          )}
        </div>

        {erro && (
          <div className="mb-4 rounded-md bg-red-900/30 border border-red-800 p-3 text-sm text-red-400">{erro}</div>
        )}

        <div className="rounded-2xl border border-gray-800 bg-[#1a1a1a] p-6 shadow-sm">
          {isEditMode && isOwner ? (
            <div className="space-y-6">
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
                <label className="block text-sm font-medium text-gray-300">Título</label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-700 bg-[#242424] px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Descrição</label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-700 bg-[#242424] px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Prazo Final</label>
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

              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  onClick={() => {
                    setIsEditMode(false);
                    loadMeta(); // Recarregar para reverter mudanças
                  }}
                  className="rounded-md border border-gray-700 px-4 py-2 text-gray-300 hover:bg-[#242424]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className={`rounded-full border px-2 py-1 text-xs font-medium ${obterCorTipo(meta.tipo)}`}>
                    {meta.tipo}
                  </span>
                  {meta.status === 'concluída' && (
                    <span className="rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white">
                      Concluída
                    </span>
                  )}
                  {meta.status === 'pausada' && (
                    <span className="rounded-full bg-gray-500 px-2 py-1 text-xs font-medium text-white">
                      Pausada
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-white">{meta.titulo}</h1>
                {meta.descricao && <p className="mt-2 text-gray-400">{meta.descricao}</p>}
              </div>

              <BarraProgresso progresso={progresso} concluidas={concluidas} total={total} />

              <div>
                <h2 className="mb-4 text-xl font-semibold text-white">Metas Pequenas</h2>
                <div className="space-y-2">
                  {metasPequenas.length === 0 ? (
                    <p className="text-gray-500">Nenhuma meta pequena criada ainda.</p>
                  ) : (
                    [...metasPequenas].sort((a, b) => a.id.localeCompare(b.id)).map((metaPequena) => (
                      <div
                        key={metaPequena.id}
                        className={`flex items-center gap-3 rounded-lg border p-3 ${
                          metaPequena.status === 'concluída'
                            ? 'border-green-600/50 bg-green-900/20'
                            : 'border-gray-800 bg-[#242424]'
                        }`}
                      >
                        {isOwner ? (
                          <>
                            <input
                              type="checkbox"
                              checked={metaPequena.status === 'concluída'}
                              onChange={() => handleToggleMetaPequena(metaPequena.id)}
                              className="h-5 w-5 rounded border-gray-600 bg-[#1a1a1a] text-purple-600 focus:ring-purple-500"
                            />
                            <input
                              type="text"
                              value={metaPequena.titulo}
                              onChange={(e) => handleMetaPequenaChange(metaPequena.id, e.target.value)}
                              onBlur={async () => {
                                if (!metaPequena.titulo.trim() && !metaPequena.id.startsWith('temp-')) {
                                  if (metasPequenas.length > 1) {
                                    await handleRemoveMetaPequena(metaPequena.id);
                                  }
                                } else if (metaPequena.titulo.trim() && !metaPequena.id.startsWith('temp-')) {
                                  // Salvar mudanças na meta pequena
                                  try {
                                    await metasApi.updateMetaPequena(metaId, metaPequena.id, {
                                      titulo: metaPequena.titulo.trim(),
                                    });
                                    await loadMeta();
                                  } catch (error) {
                                    // Ignorar erros ao salvar
                                  }
                                }
                              }}
                              className={`flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-white ${
                                metaPequena.status === 'concluída'
                                  ? 'line-through text-gray-500'
                                  : ''
                              } focus:border-purple-500 focus:outline-none`}
                            />
                            {metasPequenas.length > 1 && (
                              <button
                                onClick={() => handleRemoveMetaPequena(metaPequena.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                ✕
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                                metaPequena.status === 'concluída'
                                  ? 'border-green-500 bg-green-500'
                                  : 'border-gray-600 bg-transparent'
                              }`}
                            >
                              {metaPequena.status === 'concluída' && (
                                <svg
                                  className="h-3 w-3 text-white"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path d="M5 13l4 4L19 7"></path>
                                </svg>
                              )}
                            </div>
                            <span
                              className={`flex-1 ${
                                metaPequena.status === 'concluída'
                                  ? 'line-through text-gray-500'
                                  : 'text-gray-300'
                              }`}
                            >
                              {metaPequena.titulo}
                            </span>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {isOwner && (
                  <button
                    onClick={handleAddMetaPequena}
                    className="mt-4 text-purple-400 hover:text-purple-300"
                  >
                    + Adicionar meta pequena
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
