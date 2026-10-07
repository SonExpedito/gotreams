'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { obterLive, type Live } from '@/api/lives';
import { comprarIngresso } from '@/api/vendas';
import { useAuth } from '@/app/AuthContext';

export default function LiveDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { usuario, carregando: carregandoSessao } = useAuth();
  const [live, setLive] = useState<Live | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [erro, setErro] = useState('');
  const [comprando, setComprando] = useState(false);

  useEffect(() => {
    obterLive(id)
      .then(setLive)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro desconhecido'));
  }, [id]);

  async function comprar() {
    if (!usuario) return router.push('/login');
    setErro('');
    setComprando(true);
    try {
      const r = await comprarIngresso(id, usuario.usuarioId, quantidade);
      router.push(`/pedido/${r.protocolo}`);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro desconhecido');
      setComprando(false);
    }
  }

  const total = live ? Number(live.precoIngresso) * (quantidade > 0 ? quantidade : 0) : 0;

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
        <button
          onClick={() => router.push('/')}
          className="mb-8 text-sm text-stone-600 underline-offset-4 hover:text-stone-900 hover:underline"
        >
          ← Voltar ao catálogo
        </button>

        {erro && (
          <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </p>
        )}
        {!live && !erro && <p className="text-stone-500">Carregando...</p>}

        {live && (
          <div className="grid gap-8 md:grid-cols-[1fr_18rem]">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{live.titulo}</h1>
              <p className="mt-4 max-w-prose whitespace-pre-line leading-relaxed text-stone-600">
                {live.descricao}
              </p>
              <p className="mt-6 text-sm text-stone-500">
                {live.capacidadeMaxima} {live.capacidadeMaxima === 1 ? 'vaga' : 'vagas'} no total
              </p>
            </div>

            <aside className="h-fit rounded-lg border border-stone-200 bg-white p-5">
              <p className="text-3xl font-bold tabular-nums">R$ {Number(live.precoIngresso).toFixed(2)}</p>
              <p className="text-sm text-stone-500">por ingresso</p>

              <label htmlFor="quantidade" className="mt-5 mb-1.5 block text-sm font-medium">
                Quantidade
              </label>
              <input
                id="quantidade"
                type="number"
                min={1}
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
                className="w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm focus:border-rose-600 focus:outline-2 focus:outline-rose-600/30"
              />

              <div className="mt-4 flex items-baseline justify-between border-t border-stone-200 pt-4 text-sm">
                <span className="text-stone-500">Total</span>
                <span className="text-lg font-semibold tabular-nums">R$ {total.toFixed(2)}</span>
              </div>

              <button
                onClick={comprar}
                disabled={comprando || carregandoSessao}
                className="mt-4 w-full rounded-md bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:opacity-50"
              >
                {usuario ? (comprando ? 'Enviando...' : 'Comprar') : 'Entrar para comprar'}
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}