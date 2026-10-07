'use client';

import { useState, SubmitEvent  } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/AuthContext';

const campo =
  'w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-rose-600 focus:outline-2 focus:outline-rose-600/30';

export default function LoginPage() {
  const { entrar, registrar } = useAuth();
  const router = useRouter();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: SubmitEvent ) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      if (modoRegistro) await registrar(nome, email, senha);
      else await entrar(email, senha);
      router.push('/');
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-10 text-stone-900">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="h-3 w-3 rounded-full bg-rose-600" aria-hidden="true" />
          <h1 className="text-2xl font-bold tracking-tight">
            {modoRegistro ? 'Criar conta' : 'Entrar'}
          </h1>
        </div>

        <form onSubmit={enviar} className="space-y-4 rounded-lg border border-stone-200 bg-white p-6">
          {modoRegistro && (
            <div>
              <label htmlFor="nome" className="mb-1.5 block text-sm font-medium">Nome</label>
              <input id="nome" className={campo} value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
          )}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">E-mail</label>
            <input id="email" type="email" className={campo} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="senha" className="mb-1.5 block text-sm font-medium">Senha</label>
            <input id="senha" type="password" className={campo} value={senha} onChange={(e) => setSenha(e.target.value)} required />
          </div>

          {erro && (
            <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-md bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:opacity-50"
          >
            {enviando ? 'Enviando...' : modoRegistro ? 'Criar conta' : 'Entrar'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setModoRegistro(!modoRegistro)}
          className="mt-4 w-full text-center text-sm text-stone-600 underline-offset-4 hover:text-stone-900 hover:underline"
        >
          {modoRegistro ? 'Já tenho conta' : 'Não tenho conta'}
        </button>
      </div>
    </main>
  );
}