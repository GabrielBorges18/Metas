'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveUser, getUserByEmail, setCurrentUser, generateId } from '@/lib/storage';
import { User } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (isLogin) {
      // Login
      const user = getUserByEmail(email);
      if (!user) {
        setErro('Usuário não encontrado');
        return;
      }
      setCurrentUser(user);
      router.push('/grupos');
    } else {
      // Cadastro
      if (!nome || !email || !senha) {
        setErro('Preencha todos os campos');
        return;
      }
      if (getUserByEmail(email)) {
        setErro('Este email já está em uso');
        return;
      }
      const newUser: User = {
        id: generateId(),
        nome,
        email,
      };
      saveUser(newUser);
      setCurrentUser(newUser);
      router.push('/grupos');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1f2e] px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm p-8 shadow-lg">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="text-4xl">🚀</div>
          </div>
          <h1 className="text-3xl font-bold text-white">Squad Goals</h1>
          <p className="mt-2 text-gray-400">Acompanhe suas metas com clareza</p>
        </div>

        <div className="flex rounded-lg border border-gray-600 bg-gray-700 p-1">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              isLogin
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-600'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              !isLogin
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-600'
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
                className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
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
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
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
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          {erro && (
            <div className="rounded-md bg-red-900/50 border border-red-700 p-3 text-sm text-red-300">
              {erro}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
