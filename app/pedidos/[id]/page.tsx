'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { consultarPedido, type PedidoStatus } from '@/api/vendas';

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
    <main>
      <button onClick={() => router.push('/')}>← Início</button>
      <h1>Pedido</h1>
      <p>Protocolo: <code>{protocolo}</code></p>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      {pedido && (
        <>
          <p>Status: <strong>{pedido.status}</strong></p>
          <p>{pedido.mensagem}</p>
          <pre>{JSON.stringify(pedido, null, 2)}</pre>
        </>
      )}
    </main>
  );
}