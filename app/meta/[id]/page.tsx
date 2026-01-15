'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCurrentUser, getCurrentGroup, getMetas, saveMeta, deleteMeta, generateId } from '@/lib/storage';
import { MetaGrande, TipoMeta, StatusMetaGrande, MetaPequena } from '@/lib/types';
import { calcularProgresso, obterCorTipo } from '@/lib/utils';
import BarraProgresso from '@/components/BarraProgresso';
import Header from '@/components/Header';

export default function DetalheMetaPage() {
  const router = useRouter();
  const params = useParams();
  const metaId = params.id as string;

  const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null);
  const [meta, setMeta] = useState<MetaGrande | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Estados para edição
  const [tipo, setTipo] = useState<TipoMeta>('Profissional');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataPrazo, setDataPrazo] = useState('');
  const [status, setStatus] = useState<StatusMetaGrande>('ativa');
  const [metasPequenas, setMetasPequenas] = useState<MetaPequena[]>([]);

  useEffect(() => {
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

    const todasMetas = getMetas();
    const metaEncontrada = todasMetas.find((m) => m.id === metaId);

    if (!metaEncontrada) {
      router.push('/quadro');
      return;
    }

    // Verificar se o usuário é o dono
    if (metaEncontrada.userId !== currentUser.id) {
      setIsEditMode(false);
    }

    setMeta(metaEncontrada);
    setTipo(metaEncontrada.tipo);
    setTitulo(metaEncontrada.titulo);
    setDescricao(metaEncontrada.descricao || '');
    setDataInicio(metaEncontrada.dataInicio.split('T')[0]);
    setDataPrazo(metaEncontrada.dataPrazo?.split('T')[0] || '');
    setStatus(metaEncontrada.status);
    setMetasPequenas([...metaEncontrada.metasPequenas]);
  }, [router, metaId]);

  const handleToggleMetaPequena = (id: string) => {
    if (!user || !meta || meta.userId !== user.id) return;

    const atualizadas = metasPequenas.map((m) =>
      m.id === id ? { ...m, status: m.status === 'concluída' ? 'pendente' : 'concluída' } : m
    );
    setMetasPequenas(atualizadas);
    saveMeta({ ...meta, metasPequenas: atualizadas });
  };

  const handleAddMetaPequena = () => {
    if (!meta) return;
    const nova: MetaPequena = {
      id: generateId(),
      titulo: '',
      status: 'pendente',
    };
    const atualizadas = [...metasPequenas, nova];
    setMetasPequenas(atualizadas);
    saveMeta({ ...meta, metasPequenas: atualizadas });
  };

  const handleRemoveMetaPequena = (id: string) => {
    if (!meta || metasPequenas.length <= 1) return;
    const atualizadas = metasPequenas.filter((m) => m.id !== id);
    setMetasPequenas(atualizadas);
    saveMeta({ ...meta, metasPequenas: atualizadas });
  };

  const handleMetaPequenaChange = (id: string, titulo: string) => {
    if (!meta) return;
    const atualizadas = metasPequenas.map((m) => (m.id === id ? { ...m, titulo } : m));
    setMetasPequenas(atualizadas);
    saveMeta({ ...meta, metasPequenas: atualizadas });
  };

  const handleSave = () => {
    if (!meta || !titulo.trim()) return;

    const metaAtualizada: MetaGrande = {
      ...meta,
      tipo,
      titulo: titulo.trim(),
      descricao: descricao.trim() || undefined,
      status,
      dataInicio,
      dataPrazo: dataPrazo || undefined,
      metasPequenas: metasPequenas.filter((m) => m.titulo.trim()),
    };

    saveMeta(metaAtualizada);
    setIsEditMode(false);
    setMeta(metaAtualizada);
  };

  const handleDelete = () => {
    if (!meta || !confirm('Tem certeza que deseja excluir esta meta?')) return;
    deleteMeta(meta.id);
    router.push('/quadro');
  };

  if (!user || !meta) {
    return <div className="flex min-h-screen items-center justify-center bg-[#1a1f2e] text-white">Carregando...</div>;
  }

  const isOwner = meta.userId === user.id;
  const progresso = calcularProgresso(meta);
  const concluidas = metasPequenas.filter((m) => m.status === 'concluída').length;
  const total = metasPequenas.length;

  return (
    <div className="min-h-screen bg-[#1a1f2e]">
      <Header />
      <div className="px-4 py-8">
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
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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

        <div className="rounded-xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm p-6 shadow-lg">
          {isEditMode && isOwner ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300">Tipo de Meta</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as TipoMeta)}
                  className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
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
                  className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Descrição</label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
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
                    className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Prazo Final</label>
                  <input
                    type="date"
                    value={dataPrazo}
                    onChange={(e) => setDataPrazo(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusMetaGrande)}
                  className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="ativa">Ativa</option>
                  <option value="pausada">Pausada</option>
                  <option value="concluída">Concluída</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setIsEditMode(false)}
                  className="rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-gray-300 hover:bg-gray-600"
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
                    <p className="text-gray-400">Nenhuma meta pequena criada ainda.</p>
                  ) : (
                    metasPequenas.map((metaPequena) => (
                      <div
                        key={metaPequena.id}
                        className={`flex items-center gap-3 rounded-lg border p-3 ${
                          metaPequena.status === 'concluída'
                            ? 'border-green-700 bg-green-900/20'
                            : 'border-gray-700 bg-gray-800/30'
                        }`}
                      >
                        {isOwner ? (
                          <>
                            <input
                              type="checkbox"
                              checked={metaPequena.status === 'concluída'}
                              onChange={() => handleToggleMetaPequena(metaPequena.id)}
                              className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              value={metaPequena.titulo}
                              onChange={(e) => handleMetaPequenaChange(metaPequena.id, e.target.value)}
                              className={`flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 ${
                                metaPequena.status === 'concluída'
                                  ? 'line-through text-gray-500'
                                  : 'text-white'
                              } focus:border-blue-500 focus:outline-none`}
                              onBlur={() => {
                                if (!metaPequena.titulo.trim() && metasPequenas.length > 1) {
                                  handleRemoveMetaPequena(metaPequena.id);
                                }
                              }}
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
                              className={`h-5 w-5 rounded border-2 ${
                                metaPequena.status === 'concluída'
                                  ? 'border-green-500 bg-green-500'
                                  : 'border-gray-600'
                              }`}
                            >
                              {metaPequena.status === 'concluída' && (
                                <svg
                                  className="h-full w-full text-white"
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
                                  : 'text-white'
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
                    className="mt-4 text-blue-400 hover:text-blue-300"
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
    </div>
  );
}
