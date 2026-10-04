'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/Authcontext';

export default function LoginPage() {
  const { entrar, registrar } = useAuth();
  const router = useRouter();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
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
    <main>
      <h1>{modoRegistro ? 'Criar conta' : 'Entrar'}</h1>
      <form onSubmit={enviar}>
        {modoRegistro && (
          <p><input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required /></p>
        )}
        <p><input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required /></p>
        <p><input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required /></p>
        {erro && <p style={{ color: 'red' }}>{erro}</p>}
        <button type="submit" disabled={enviando}>{enviando ? 'Enviando...' : modoRegistro ? 'Criar conta' : 'Entrar'}</button>{' '}
        <button type="button" onClick={() => setModoRegistro(!modoRegistro)}>
          {modoRegistro ? 'Já tenho conta' : 'Não tenho conta'}
        </button>
      </form>
    </main>
  );
}