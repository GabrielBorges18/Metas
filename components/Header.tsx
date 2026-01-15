'use client';

import { useRouter } from 'next/navigation';
import { getCurrentUser, setCurrentUser, setCurrentGroup } from '@/lib/storage';
import { useEffect, useState } from 'react';
import { User } from '@/lib/types';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentGroup(null);
    router.push('/login');
  };

  if (!user) return null;

  return (
    <header className="flex items-center justify-between border-b border-gray-700 bg-gray-900 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="text-2xl">🚀</div>
        <h1 className="text-2xl font-bold text-white">Metas</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-300">
          Logado como: <span className="font-semibold text-white">{user.nome.toUpperCase()}</span>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
