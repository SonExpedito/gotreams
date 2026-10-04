'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  encerrarSessao,
  obterUsuarioAtual,
  realizarLogin,
  registrarUsuario,
  type Usuario,
} from '@/api/auth';

interface AuthContextValue {
  usuario: Usuario | null;
  carregando: boolean; // true enquanto verifica a sessão ao abrir a página
  entrar: (email: string, senha: string) => Promise<void>;
  registrar: (nome: string, email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Ao abrir ou recarregar a página: o cookie vai junto e o backend diz quem é o usuário
  useEffect(() => {
    let cancelado = false; // evita atualizar o estado se o componente for desmontado (ex.: Strict Mode em dev)

    async function restaurarSessao() {
      try {
        const u = await obterUsuarioAtual();
        if (!cancelado) setUsuario(u);
      } catch {
        if (!cancelado) setUsuario(null); // serviço de login fora do ar: segue deslogado
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    restaurarSessao();
    return () => {
      cancelado = true;
    };
  }, []);

  const entrar = useCallback(async (email: string, senha: string) => {
    const { usuarioId, nome, email: emailRetornado } = await realizarLogin(email, senha);
    setUsuario({ usuarioId, nome, email: emailRetornado }); // o token fica só no cookie
  }, []);

  const registrar = useCallback(async (nome: string, email: string, senha: string) => {
    const r = await registrarUsuario(nome, email, senha);
    setUsuario({ usuarioId: r.usuarioId, nome: r.nome, email: r.email });
  }, []);

  const sair = useCallback(async () => {
    await encerrarSessao();
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, carregando, entrar, registrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}

/*
  USO

  app/layout.tsx (Server Component, só envolve os filhos):
    <AuthProvider>{children}</AuthProvider>

  Em qualquer Client Component ('use client'):
    const { usuario, carregando, entrar, sair } = useAuth();

  Proteger uma página (espere 'carregando' acabar antes de redirecionar,
  senão o F5 sempre joga o usuário para o login):
    const router = useRouter(); // de 'next/navigation'
    useEffect(() => {
      if (!carregando && !usuario) router.replace('/login');
    }, [carregando, usuario, router]);
    if (carregando || !usuario) return <p>Carregando...</p>;

  Login e redirecionamento:
    await entrar(email, senha);
    router.push('/lives');

  Comprar:
    comprarIngresso(liveId, usuario.usuarioId, quantidade);
*/