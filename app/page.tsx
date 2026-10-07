'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listarLives, type Live } from '@/api/lives';
import { useAuth } from '@/app/AuthContext';

const btnPrimario =
  'rounded-md bg-rose-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:opacity-50';
const btnSecundario =
  'rounded-md border border-stone-300 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500';

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
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-600" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Catálogo de lives</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            {carregandoSessao ? (
              <span className="text-stone-500">Verificando sessão...</span>
            ) : usuario ? (
              <>
                <span className="text-stone-600">
                  Olá, <strong className="font-semibold text-stone-900">{usuario.nome}</strong>
                </span>
                <button onClick={sair} className={btnSecundario}>Sair</button>
              </>
            ) : (
              <button onClick={() => router.push('/login')} className={btnPrimario}>Fazer login</button>
            )}
            <button onClick={() => router.push('/teste')} className={btnSecundario}>Painel de testes</button>
          </div>
        </header>

        <section className="mt-8">
          {erro && (
            <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </p>
          )}
          {carregando && <p className="text-stone-500">Carregando lives...</p>}
          {!carregando && !erro && lives.length === 0 && (
            <div className="rounded-lg border border-dashed border-stone-300 px-6 py-12 text-center">
              <p className="font-medium">Nenhuma live disponível</p>
              <p className="mt-1 text-sm text-stone-500">Crie a primeira no painel de testes.</p>
              <button onClick={() => router.push('/teste')} className={`${btnPrimario} mt-4`}>
                Abrir painel de testes
              </button>
            </div>
          )}

          {lives.length > 0 && (
            <ul className="divide-y divide-stone-200 overflow-hidden rounded-lg border border-stone-200 bg-white">
              {lives.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold">{l.titulo}</h2>
                    <p className="mt-0.5 text-sm text-stone-500">
                      {l.capacidadeMaxima} {l.capacidadeMaxima === 1 ? 'vaga' : 'vagas'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold tabular-nums">
                      R$ {Number(l.precoIngresso).toFixed(2)}
                    </span>
                    <button onClick={() => router.push(`/live/${l.id}`)} className={btnSecundario}>
                      Ver detalhes
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}