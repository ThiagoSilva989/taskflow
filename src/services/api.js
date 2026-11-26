
import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = (
  import.meta.env.VITE_API_URL ||
  'https://api.thiago.grupo-02.sd.ufersa.dev.br'
).replace(/\/$/, '');

async function request(path, options = {}) {
  // Recupera a sessão autenticada do Cognito
  const session = await fetchAuthSession();

  // Utiliza o ID Token, compatível com o Audience do JWT Authorizer
  const token = session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  const raw = await response.text();

  let data = null;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Não autorizado. Faça login novamente.');
    }

    if (response.status === 403) {
      throw new Error('Você não tem permissão para acessar este recurso.');
    }

    const message =
      data?.message ||
      data?.error ||
      data?.body ||
      `Erro HTTP ${response.status}`;

    throw new Error(
      typeof message === 'string' ? message : JSON.stringify(message)
    );
  }

  // Algumas integrações Lambda devolvem JSON dentro de "body".
  if (data && typeof data.body === 'string') {
    try {
      return JSON.parse(data.body);
    } catch {
      return data;
    }
  }

  return data;
}

export const api = {
  listar: () => request('/tarefas'),

  buscar: (id) =>
    request(`/tarefas/${encodeURIComponent(id)}`),

  criar: (tarefa) =>
    request('/tarefas', {
      method: 'POST',
      body: JSON.stringify(tarefa),
    }),

  atualizar: (id, tarefa) =>
    request(`/tarefas/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(tarefa),
    }),

  excluir: (id) =>
    request(`/tarefas/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
};

export function normalizarLista(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.tarefas)) return data.tarefas;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.Items)) return data.Items;

  return [];
}
