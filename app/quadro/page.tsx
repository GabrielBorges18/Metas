'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getCurrentGroup, getMetasByGroup, getUserById } from '@/lib/storage';
import { Group, MetaGrande, User } from '@/lib/types';
import { calcularProgresso, obterCorTipo } from '@/lib/utils';
import BarraProgresso from '@/components/BarraProgresso';
import Header from '@/components/Header';
import Link from 'next/link';

export default function QuadroPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [grupo, setGrupo] = useState<Group | null>(null);
  const [metas, setMetas] = useState<MetaGrande[]>([]);
  const [usuarios, setUsuarios] = useState<Record<string, User>>({});

  useEffect(() => {
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

    const grupoMetas = getMetasByGroup(currentGroup.id);
    setMetas(grupoMetas);

    // Carregar dados dos usuários
    const usuariosMap: Record<string, User> = {};
    currentGroup.membrosIds.forEach((id) => {
      const u = getUserById(id);
      if (u) usuariosMap[id] = u;
    });
    setUsuarios(usuariosMap);
  }, [router]);

  const metasPorUsuario = grupo
    ? grupo.membrosIds.map((userId) => {
        const usuario = usuarios[userId];
        const metasUsuario = metas.filter((m) => m.userId === userId);
        return { usuario, metas: metasUsuario };
      })
    : [];

  if (!user || !grupo) {
    return <div className="flex min-h-screen items-center justify-center bg-[#1a1f2e] text-white">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-[#1a1f2e]">
      <Header />
      <div className="px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{grupo.nome}</h1>
              <p className="mt-1 text-gray-400">{grupo.descricao}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/grupos"
                className="rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-gray-300 hover:bg-gray-700"
              >
                Voltar
              </Link>
              <Link
                href="/meta/nova"
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Nova Meta
              </Link>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {metasPorUsuario.map(({ usuario, metas: metasUsuario }) => {
              if (!usuario) return null;
              const isCurrentUser = usuario.id === user.id;

              return (
                <div
                  key={usuario.id}
                  className="rounded-xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm p-6 shadow-lg"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      {usuario.nome}
                      {isCurrentUser && <span className="ml-2 text-sm text-gray-400">(Você)</span>}
                    </h2>
                  </div>

                  {metasUsuario.length === 0 ? (
                    <p className="text-gray-400">Nenhuma meta criada ainda.</p>
                  ) : (
                    <div className="space-y-4">
                      {metasUsuario.map((meta) => {
                        const progresso = calcularProgresso(meta);
                        const concluidas = meta.metasPequenas.filter((m) => m.status === 'concluída').length;
                        const total = meta.metasPequenas.length;

                        const isPausada = meta.status === 'pausada';
                        const isConcluida = meta.status === 'concluída';

                        return (
                          <div
                            key={meta.id}
                            className={`rounded-lg border p-4 transition-all ${
                              isPausada
                                ? 'border-gray-700 bg-gray-800/30 opacity-60'
                                : isConcluida
                                ? 'border-green-600/50 bg-green-900/20'
                                : 'border-gray-700 bg-gray-800/30 hover:bg-gray-800/50'
                            }`}
                          >
                            <div className="mb-3">
                              <h3 className="mb-2 text-lg font-semibold text-white">{meta.titulo}</h3>
                              {meta.descricao && (
                                <p className="mb-2 text-sm text-gray-400">{meta.descricao}</p>
                              )}
                              <div className="mb-2 flex items-center gap-2">
                                <span
                                  className={`rounded-full border px-2 py-1 text-xs font-medium ${obterCorTipo(
                                    meta.tipo
                                  )}`}
                                >
                                  {meta.tipo}
                                </span>
                                {isConcluida && (
                                  <span className="rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white">
                                    Concluída
                                  </span>
                                )}
                                {isPausada && (
                                  <span className="rounded-full bg-gray-500 px-2 py-1 text-xs font-medium text-white">
                                    Pausada
                                  </span>
                                )}
                              </div>
                            </div>

                            <BarraProgresso
                              progresso={progresso}
                              concluidas={concluidas}
                              total={total}
                              className="mt-3"
                            />

                            {user.id === meta.userId && (
                              <Link
                                href={`/meta/${meta.id}`}
                                className="mt-3 block text-sm text-blue-400 hover:text-blue-300"
                              >
                                Ver detalhes →
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
