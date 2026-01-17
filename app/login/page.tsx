'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { setAuthToken, setCurrentUser } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const response = await authApi.login(email, senha);
        setAuthToken(response.token);
        setCurrentUser(response.user);
        router.push('/grupos');
      } else {
        // Cadastro
        if (!nome || !email || !senha) {
          setErro('Preencha todos os campos');
          setLoading(false);
          return;
        }
        const response = await authApi.register(nome, email, senha);
        setAuthToken(response.token);
        setCurrentUser(response.user);
        router.push('/grupos');
      }
    } catch (error: any) {
      setErro(error.message || 'Erro ao realizar operação');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-800 bg-[#1a1a1a] p-8 shadow-xl">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <span className="text-4xl">🚀</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Metas</h1>
          <p className="mt-2 text-gray-400">Acompanhe suas metas com clareza</p>
        </div>

        <div className="flex rounded-lg border border-gray-800 bg-[#242424] p-1">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              isLogin
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              !isLogin
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-300">
                Nome
              </label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-700 bg-[#242424] px-3 py-2 text-white placeholder-gray-500 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                placeholder="Seu nome"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-700 bg-[#242424] px-3 py-2 text-white placeholder-gray-500 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-300">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-700 bg-[#242424] px-3 py-2 text-white placeholder-gray-500 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
              placeholder="••••••••"
              required
            />
          </div>

          {erro && (
            <div className="rounded-md bg-red-900/30 border border-red-800 p-3 text-sm text-red-400">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
