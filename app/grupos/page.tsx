'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, setCurrentGroup, clearAuth } from '@/lib/auth';
import { groupsApi, GroupResponse, authApi } from '@/lib/api';
import { User } from '@/lib/types';

export default function GruposPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [grupos, setGrupos] = useState<GroupResponse[]>([]);
  const [mostrarCriar, setMostrarCriar] = useState(false);
  const [mostrarEntrar, setMostrarEntrar] = useState(false);
  const [nomeGrupo, setNomeGrupo] = useState('');
  const [descricaoGrupo, setDescricaoGrupo] = useState('');
  const [codigoConvite, setCodigoConvite] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    loadGrupos();
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const loadGrupos = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      const gruposData = await groupsApi.index();
      setGrupos(gruposData);
    } catch (error: any) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        clearAuth();
        router.push('/login');
      }
      setErro('Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

  const handleCriarGrupo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeGrupo.trim() || !user) return;

    try {
      setErro('');
      
      const novoGrupo = await groupsApi.store(nomeGrupo, descricaoGrupo || undefined);
      await loadGrupos();
      setNomeGrupo('');
      setDescricaoGrupo('');
      setMostrarCriar(false);
    } catch (error: any) {
      setErro(error.message || 'Erro ao criar grupo');
    }
  };

  const handleEntrarGrupo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoConvite.trim() || !user) return;

    try {
      setErro('');
      await groupsApi.join(codigoConvite.toUpperCase());
      await loadGrupos();
      setCodigoConvite('');
      setMostrarEntrar(false);
    } catch (error: any) {
      setErro(error.message || 'Erro ao entrar no grupo');
    }
  };

  const handleSelecionarGrupo = (grupo: GroupResponse) => {
    setCurrentGroup({ id: grupo.id });
    router.push('/quadro');
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] text-white">Carregando...</div>;
  }

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] text-white">Redirecionando...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Meus Grupos</h1>
            <p className="mt-1 text-gray-400">Olá, {user.nome}!</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMostrarCriar(true);
                setMostrarEntrar(false);
                setErro('');
              }}
              className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
            >
              Criar Grupo
            </button>
            <button
              onClick={() => {
                setMostrarEntrar(true);
                setMostrarCriar(false);
                setErro('');
              }}
              className="rounded-md border border-gray-700 bg-[#1a1a1a] px-4 py-2 text-gray-300 hover:bg-[#242424]"
            >
              Entrar em Grupo
            </button>
            <button
              onClick={handleLogout}
              className="rounded-md border border-gray-700 bg-[#1a1a1a] px-4 py-2 text-sm text-gray-300 transition-colors hover:border-red-600 hover:bg-red-900/20 hover:text-red-400"
            >
              Sair
            </button>
          </div>
        </div>

        {erro && (
          <div className="mb-4 rounded-md bg-red-900/30 border border-red-800 p-3 text-sm text-red-400">{erro}</div>
        )}

        {mostrarCriar && (
          <div className="mb-6 rounded-2xl border border-gray-800 bg-[#1a1a1a] p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-white">Criar Novo Grupo</h2>
            <form onSubmit={handleCriarGrupo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Nome do Grupo</label>
                <input
                  type="text"
                  value={nomeGrupo}
                  onChange={(e) => setNomeGrupo(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-700 bg-[#242424] px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  placeholder="Ex: Dev 2026"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Descrição (opcional)</label>
                <textarea
                  value={descricaoGrupo}
                  onChange={(e) => setDescricaoGrupo(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-700 bg-[#242424] px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  placeholder="Descrição curta do grupo"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
                >
                  Criar
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarCriar(false)}
                  className="rounded-md border border-gray-700 px-4 py-2 text-gray-300 hover:bg-[#242424]"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {mostrarEntrar && (
          <div className="mb-6 rounded-2xl border border-gray-800 bg-[#1a1a1a] p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-white">Entrar em Grupo</h2>
            <form onSubmit={handleEntrarGrupo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Código de Convite</label>
                <input
                  type="text"
                  value={codigoConvite}
                  onChange={(e) => setCodigoConvite(e.target.value.toUpperCase())}
                  className="mt-1 block w-full rounded-md border border-gray-700 bg-[#242424] px-3 py-2 font-mono text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  placeholder="ABC123"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarEntrar(false)}
                  className="rounded-md border border-gray-700 px-4 py-2 text-gray-300 hover:bg-[#242424]"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {grupos.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-[#1a1a1a] p-12 text-center">
            <p className="text-gray-400">Você ainda não está em nenhum grupo.</p>
            <p className="mt-2 text-sm text-gray-500">Crie um grupo ou entre em um existente para começar!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {grupos.map((grupo) => (
              <div
                key={grupo.id}
                onClick={() => handleSelecionarGrupo(grupo)}
                className="cursor-pointer rounded-2xl border border-gray-800 bg-[#1a1a1a] p-6 transition-all hover:border-purple-500/50 hover:shadow-lg"
              >
                <h3 className="text-xl font-semibold text-white">{grupo.nome}</h3>
                <p className="mt-1 text-sm text-gray-400">{grupo.descricao}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {grupo.membrosIds.length} {grupo.membrosIds.length === 1 ? 'membro' : 'membros'}
                  </span>
                  <span className="text-sm font-mono text-purple-400">{grupo.codigoConvite}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
