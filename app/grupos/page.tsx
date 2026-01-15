'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getUserGroups, saveGroup, setCurrentGroup, generateId, generateCodigoConvite, getGroupByCodigoConvite } from '@/lib/storage';
import { Group, User } from '@/lib/types';
import Header from '@/components/Header';

export default function GruposPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [grupos, setGrupos] = useState<Group[]>([]);
  const [mostrarCriar, setMostrarCriar] = useState(false);
  const [mostrarEntrar, setMostrarEntrar] = useState(false);
  const [nomeGrupo, setNomeGrupo] = useState('');
  const [descricaoGrupo, setDescricaoGrupo] = useState('');
  const [codigoConvite, setCodigoConvite] = useState('');

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    setGrupos(getUserGroups(currentUser.id));
  }, [router]);

  const handleCriarGrupo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeGrupo.trim() || !user) return;

    const novoGrupo: Group = {
      id: generateId(),
      nome: nomeGrupo,
      descricao: descricaoGrupo || 'Sem descrição',
      codigoConvite: generateCodigoConvite(),
      criadorId: user.id,
      membrosIds: [user.id],
      createdAt: new Date().toISOString(),
    };

    saveGroup(novoGrupo);
    setGrupos(getUserGroups(user.id));
    setNomeGrupo('');
    setDescricaoGrupo('');
    setMostrarCriar(false);
  };

  const handleEntrarGrupo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoConvite.trim() || !user) return;

    const grupo = getGroupByCodigoConvite(codigoConvite.toUpperCase());
    if (!grupo) {
      alert('Código de convite inválido');
      return;
    }

    if (grupo.membrosIds.includes(user.id)) {
      alert('Você já é membro deste grupo');
      return;
    }

    grupo.membrosIds.push(user.id);
    saveGroup(grupo);
    setGrupos(getUserGroups(user.id));
    setCodigoConvite('');
    setMostrarEntrar(false);
  };

  const handleSelecionarGrupo = (grupo: Group) => {
    setCurrentGroup(grupo);
    router.push('/quadro');
  };

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center bg-[#1a1f2e] text-white">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-[#1a1f2e]">
      <Header />
      <div className="px-4 py-8">
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
              }}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Criar Grupo
            </button>
            <button
              onClick={() => {
                setMostrarEntrar(true);
                setMostrarCriar(false);
              }}
              className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            >
              Entrar em Grupo
            </button>
          </div>
        </div>

          {mostrarCriar && (
            <div className="mb-6 rounded-xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold text-white">Criar Novo Grupo</h2>
              <form onSubmit={handleCriarGrupo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Nome do Grupo</label>
                  <input
                    type="text"
                    value={nomeGrupo}
                    onChange={(e) => setNomeGrupo(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="Ex: Dev 2026"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Descrição (opcional)</label>
                  <textarea
                    value={descricaoGrupo}
                    onChange={(e) => setDescricaoGrupo(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="Descrição curta do grupo"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Criar
                  </button>
                  <button
                    type="button"
                    onClick={() => setMostrarCriar(false)}
                    className="rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-gray-300 hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {mostrarEntrar && (
            <div className="mb-6 rounded-xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold text-white">Entrar em Grupo</h2>
              <form onSubmit={handleEntrarGrupo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Código de Convite</label>
                  <input
                    type="text"
                    value={codigoConvite}
                    onChange={(e) => setCodigoConvite(e.target.value.toUpperCase())}
                    className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 font-mono text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="ABC123"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Entrar
                  </button>
                  <button
                    type="button"
                    onClick={() => setMostrarEntrar(false)}
                    className="rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-gray-300 hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {grupos.length === 0 ? (
            <div className="rounded-xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm p-12 text-center">
              <p className="text-gray-300">Você ainda não está em nenhum grupo.</p>
              <p className="mt-2 text-sm text-gray-400">Crie um grupo ou entre em um existente para começar!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {grupos.map((grupo) => (
                <div
                  key={grupo.id}
                  onClick={() => handleSelecionarGrupo(grupo)}
                  className="cursor-pointer rounded-xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm p-6 shadow-lg transition-all hover:bg-gray-800/70 hover:shadow-xl"
                >
                  <h3 className="text-xl font-semibold text-white">{grupo.nome}</h3>
                  <p className="mt-1 text-sm text-gray-400">{grupo.descricao}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      {grupo.membrosIds.length} {grupo.membrosIds.length === 1 ? 'membro' : 'membros'}
                    </span>
                    <span className="text-sm font-mono text-gray-500">{grupo.codigoConvite}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
