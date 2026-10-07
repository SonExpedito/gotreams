'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { consultarPedido, type PedidoStatus } from '@/api/vendas';

function estiloStatus(status: string) {
  const s = status.toUpperCase();
  if (s === 'PROCESSANDO') return 'bg-amber-100 text-amber-800';
  if (/(CONFIRM|APROV|CONCLU|SUCESSO)/.test(s)) return 'bg-emerald-100 text-emerald-800';
  if (/(RECUS|FALH|ERRO|ESGOT|CANCEL|REJEIT)/.test(s)) return 'bg-red-100 text-red-800';
  return 'bg-stone-200 text-stone-700';
}

export default function PedidoPage() {
  const { protocolo } = useParams<{ protocolo: string }>();
  const router = useRouter();
  const [pedido, setPedido] = useState<PedidoStatus | null>(null);
  const [erro, setErro] = useState('');

  // Polling: consulta a cada 1s até o status sair de PROCESSANDO (máx. 30 tentativas)
  useEffect(() => {
    let ativo = true;
    let tentativas = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function consultar() {
      try {
        const p = await consultarPedido(protocolo);
        if (!ativo) return;
        setPedido(p);
        if (p.status !== 'PROCESSANDO') return;
      } catch (e: unknown) {
        if (ativo) setErro(e instanceof Error ? e.message : 'Erro desconhecido');
        return;
      }
      if (++tentativas < 30) timer = setTimeout(consultar, 1000);
    }

    consultar();
    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [protocolo]);

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto w-full max-w-xl px-4 py-8 sm:py-12">
        <button
          onClick={() => router.push('/')}
          className="mb-8 text-sm text-stone-600 underline-offset-4 hover:text-stone-900 hover:underline"
        >
          ← Início
        </button>

        <h1 className="text-3xl font-bold tracking-tight">Seu pedido</h1>
        <p className="mt-2 text-sm text-stone-500">
          Protocolo{' '}
          <code className="rounded bg-stone-200 px-1.5 py-0.5 font-mono text-xs text-stone-800">{protocolo}</code>
        </p>

        {erro && (
          <p role="alert" className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </p>
        )}

        {!pedido && !erro && <p className="mt-6 text-stone-500">Consultando pedido...</p>}

        {pedido && (
          <div className="mt-6 rounded-lg border border-stone-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${estiloStatus(pedido.status)}`}>
                {pedido.status}
              </span>
              {pedido.status === 'PROCESSANDO' && (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-stone-700 motion-reduce:animate-none"
                  aria-label="Atualizando"
                />
              )}
            </div>
            <p className="mt-4 text-stone-700">{pedido.mensagem}</p>

            <details className="mt-5 border-t border-stone-200 pt-4">
              <summary className="cursor-pointer text-sm text-stone-500 hover:text-stone-900">
                Ver resposta completa
              </summary>
              <pre className="mt-3 overflow-x-auto rounded-md bg-stone-100 p-3 font-mono text-xs text-stone-800">
                {JSON.stringify(pedido, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </main>
  );
}