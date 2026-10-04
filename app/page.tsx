'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listarLives, type Live } from '@/api/lives';
import { useAuth } from '@/app/Authcontext';

export default function HomePage() {
  const router = useRouter();
  const { usuario, carregando: carregandoSessao, sair } = useAuth();
  const [lives, setLives] = useState<Live[]>([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    listarLives()
      .then(setLives)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro desconhecido'))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <main>
      <header>
        <h1>Catálogo de Lives</h1>
        {carregandoSessao ? (
          <span>verificando sessão...</span>
        ) : usuario ? (
          <span>
            Olá, {usuario.nome} <button onClick={sair}>Sair</button>
          </span>
        ) : (
          <button onClick={() => router.push('/login')}>Fazer login</button>
        )}
        {' '}<button onClick={() => router.push('/teste')}>Painel de testes</button>
      </header>

      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      {carregando && <p>Carregando...</p>}
      {!carregando && !erro && lives.length === 0 && <p>Nenhuma live. Crie uma em /teste.</p>}

      <ul>
        {lives.map((l) => (
          <li key={l.id}>
            <strong>{l.titulo}</strong> — R$ {Number(l.precoIngresso).toFixed(2)} — {l.capacidadeMaxima} vagas{' '}
            <button onClick={() => router.push(`/live/${l.id}`)}>Ver detalhes</button>
          </li>
        ))}
      </ul>
    </main>
  );
}