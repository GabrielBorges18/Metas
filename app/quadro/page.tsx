'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getCurrentGroup, clearAuth } from '@/lib/auth';
import { metasApi, MetaGrandeResponse, authApi } from '@/lib/api';
import { User } from '@/lib/types';
import { calcularProgresso, obterCorTipo } from '@/lib/utils';
import BarraProgresso from '@/components/BarraProgresso';
import Link from 'next/link';

export default function QuadroPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [grupo, setGrupo] = useState<{ id: string } | null>(null);
  const [metas, setMetas] = useState<MetaGrandeResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = getCurrentUser();
      const currentGroup = getCurrentGroup();

      if (!currentUser) {
        router.push('/login');
        return;
      }

      if (!currentGroup) {
        router.push('/grupos');
        return;
      }

      setUser(currentUser);
      setGrupo(currentGroup);

      const metasData = await metasApi.index(currentGroup.id);
      setMetas(metasData);
    } catch (error: any) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        clearAuth();
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignorar erros ao fazer logout
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  // Agrupar metas por usuário e ordenar por ID
  const metasPorUsuario: Record<string, { usuario: User; metas: MetaGrandeResponse[] }> = {};

  // Ordenar todas as metas por ID (ordem de criação no backend)
  const metasOrdenadas = [...metas].sort((a, b) => {
    // Comparar IDs como strings para manter ordem de criação
    return a.id.localeCompare(b.id);
  });

  metasOrdenadas.forEach((meta) => {
    if (meta.user) {
      const userId = meta.user.id;
      if (!metasPorUsuario[userId]) {
        metasPorUsuario[userId] = {
          usuario: {
            id: meta.user.id,
            nome: meta.user.nome,
            email: meta.user.email,
          },
          metas: [],
        };
      }
      metasPorUsuario[userId].metas.push(meta);
    }
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] text-white">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user || !grupo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] text-white">
        <div>Redirecionando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚀</span>
            <h1 className="text-3xl font-bold text-white">Metas</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Logado como: <span className="text-purple-400 font-medium">{user.nome}</span>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md border border-gray-700 bg-[#1a1a1a] px-4 py-2 text-sm text-gray-300 transition-colors hover:border-red-600 hover:bg-red-900/20 hover:text-red-400"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Cards Container */}
        {Object.keys(metasPorUsuario).length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-[#1a1a1a] p-12 text-center">
            <p className="text-gray-400">Nenhuma meta criada ainda neste grupo.</p>
            <p className="mt-2 text-sm text-gray-500">Crie sua primeira meta para começar!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.values(metasPorUsuario).map(({ usuario, metas: metasUsuario }) => {
              const isCurrentUser = usuario.id === user.id;
              
              return (
                <div
                  key={usuario.id}
                  className="rounded-2xl border border-gray-800 bg-[#1a1a1a] p-6 transition-all hover:border-gray-700"
                >
                  {/* User Header */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600/20 text-purple-400">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      {usuario.nome} {isCurrentUser && <span className="text-purple-400">(Você)</span>}
                    </h2>
                  </div>

                  {metasUsuario.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhuma meta criada ainda.</p>
                  ) : (
                    <div className="space-y-4">
                      {metasUsuario.map((meta) => {
                        const progresso = calcularProgresso(meta as any);
                        const concluidas = meta.metasPequenas.filter((m) => m.status === 'concluída').length;
                        const total = meta.metasPequenas.length;

                        return (
                          <div
                            key={meta.id}
                            className="rounded-xl border border-gray-800 bg-[#242424] p-4 transition-all hover:border-purple-500/50 cursor-pointer"
                            onClick={() => router.push(`/meta/${meta.id}`)}
                          >
                            {/* Meta Grande Title */}
                            <h3 className="mb-3 text-lg font-semibold text-white">{meta.titulo}</h3>

                            {/* Progress Bar */}
                            <div className="mb-4">
                              <div className="mb-1 flex justify-between text-sm">
                                <span className="font-medium text-gray-300">{progresso}%</span>
                                <span className="text-gray-500">{concluidas}/{total}</span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
                                <div
                                  className="h-full bg-purple-600 transition-all duration-300"
                                  style={{ width: `${progresso}%` }}
                                />
                              </div>
                            </div>

                            {/* Metas Pequenas */}
                            <div className="space-y-2">
                              {[...meta.metasPequenas].sort((a, b) => a.id.localeCompare(b.id)).map((metaPequena) => (
                                <div
                                  key={metaPequena.id}
                                  className="flex items-center gap-2 text-sm"
                                  onClick={(e) => {
                                    if (isCurrentUser) {
                                      e.stopPropagation();
                                      router.push(`/meta/${meta.id}`);
                                    }
                                  }}
                                >
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
                                    className={`${
                                      metaPequena.status === 'concluída'
                                        ? 'line-through text-gray-500'
                                        : 'text-gray-300'
                                    }`}
                                  >
                                    {metaPequena.titulo}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Action Button */}
        <Link
          href="/meta/nova"
          className="fixed bottom-8 right-8 flex items-center gap-2 rounded-full bg-purple-600 px-6 py-4 text-white shadow-lg transition-all hover:bg-purple-700 hover:scale-105"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-medium">Nova Meta</span>
        </Link>
      </div>
    </div>
  );
}
