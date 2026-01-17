// Cliente API para consumir o backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://metas-backend-jzea.onrender.com';

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Função auxiliar para fazer requisições
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      message: response.statusText || 'Erro na requisição',
    }));
    throw new Error(error.message || 'Erro na requisição');
  }

  return response.json();
}

// Auth
export const authApi = {
  register: async (nome: string, email: string, password: string) => {
    return request<{ user: { id: string; nome: string; email: string }; token: string }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ nome, email, password }),
      }
    );
  },

  login: async (email: string, password: string) => {
    return request<{ user: { id: string; nome: string; email: string }; token: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
  },

  me: async () => {
    return request<{ id: string; nome: string; email: string }>('/api/auth/me');
  },

  logout: async () => {
    return request<{ message: string }>('/api/auth/logout', { method: 'POST' });
  },
};

// Groups
export interface GroupResponse {
  id: string;
  nome: string;
  descricao: string;
  codigoConvite: string;
  criadorId: string;
  membrosIds: string[];
  createdAt: string;
}

export const groupsApi = {
  index: async () => {
    return request<GroupResponse[]>('/api/groups');
  },

  show: async (id: string) => {
    return request<GroupResponse>(`/api/groups/${id}`);
  },

  store: async (nome: string, descricao?: string) => {
    return request<GroupResponse>('/api/groups', {
      method: 'POST',
      body: JSON.stringify({ nome, descricao }),
    });
  },

  join: async (codigoConvite: string) => {
    return request<GroupResponse>('/api/groups/join', {
      method: 'POST',
      body: JSON.stringify({ codigoConvite }),
    });
  },
};

// Metas
export interface MetaPequenaResponse {
  id: string;
  titulo: string;
  status: 'pendente' | 'concluída';
}

export interface MetaGrandeResponse {
  id: string;
  userId: string;
  tipo: 'Profissional' | 'Pessoal' | 'Estudos' | 'Saúde' | 'Outro';
  titulo: string;
  descricao?: string;
  status: 'ativa' | 'concluída' | 'pausada';
  dataInicio: string;
  dataPrazo?: string;
  metasPequenas: MetaPequenaResponse[];
  user?: {
    id: string;
    nome: string;
    email: string;
  };
}

export const metasApi = {
  index: async (grupoId?: string) => {
    const query = grupoId ? `?grupoId=${grupoId}` : '';
    return request<MetaGrandeResponse[]>(`/api/metas${query}`);
  },

  show: async (id: string) => {
    return request<MetaGrandeResponse>(`/api/metas/${id}`);
  },

  store: async (data: {
    tipo: string;
    titulo: string;
    descricao?: string;
    status?: string;
    dataInicio: string;
    dataPrazo?: string;
    grupoId?: string;
    metasPequenas?: Array<{ titulo: string }>;
  }) => {
    return request<MetaGrandeResponse>('/api/metas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: {
    tipo?: string;
    titulo?: string;
    descricao?: string;
    status?: string;
    dataInicio?: string;
    dataPrazo?: string;
    metasPequenas?: Array<{ id?: string; titulo: string; status: string }>;
  }) => {
    return request<MetaGrandeResponse>(`/api/metas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  destroy: async (id: string) => {
    return request<{ message: string }>(`/api/metas/${id}`, {
      method: 'DELETE',
    });
  },

  addMetaPequena: async (metaId: string, titulo: string) => {
    return request<MetaPequenaResponse>(`/api/metas/${metaId}/metas-pequenas`, {
      method: 'POST',
      body: JSON.stringify({ titulo }),
    });
  },

  updateMetaPequena: async (metaId: string, metaPequenaId: string, data: {
    titulo?: string;
    status?: string;
  }) => {
    return request<MetaPequenaResponse>(`/api/metas/${metaId}/metas-pequenas/${metaPequenaId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteMetaPequena: async (metaId: string, metaPequenaId: string) => {
    return request<{ message: string }>(`/api/metas/${metaId}/metas-pequenas/${metaPequenaId}`, {
      method: 'DELETE',
    });
  },
};
