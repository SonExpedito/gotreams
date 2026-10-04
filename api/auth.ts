export interface LoginResponse {
  token: string;
  usuarioId: string;
  nome: string;
  email: string;
}

// /auth/me não devolve token (ele já está no cookie HttpOnly)
export interface Usuario {
  usuarioId: string;
  nome: string;
  email: string;
}

export async function realizarLogin(email: string, senha: string): Promise<LoginResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('E-mail ou senha inválidos.');
  }

  return res.json();
}

export async function registrarUsuario(nome: string, email: string, senha: string): Promise<LoginResponse> {
  const res = await fetch('/api/auth/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha }),
    credentials: 'include', // ADICIONADO: o registro também emite o token, então precisa gravar o cookie
  });

  if (!res.ok) {
    throw new Error('Erro ao criar conta. Este e-mail já pode estar em uso.');
  }

  return res.json();
}

/**
 * NOVO: pergunta ao backend "quem sou eu?" usando o cookie jwt_token.
 * Retorna null se não houver sessão válida (sem cookie, token expirado ou inválido).
 * Lança erro apenas se o serviço estiver fora do ar.
 */
export async function obterUsuarioAtual(): Promise<Usuario | null> {
  const res = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include',
  });

  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) throw new Error('Não foi possível verificar a sessão.');

  return res.json();
}

/**
 * NOVO: encerra a sessão.
 * O cookie é HttpOnly, então só o backend consegue apagá-lo.
 * TODO (backend): criar POST /auth/logout que responda com Set-Cookie: jwt_token=; Max-Age=0; Path=/
 */
export async function encerrarSessao(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  } catch {
    // sem endpoint ou serviço fora do ar: o estado local é limpo mesmo assim
  }
}