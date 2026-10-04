export type StatusPedido = 'PROCESSANDO' | 'COMPRA_REALIZADA' | 'COMPRA_RECUSADA';

export interface CompraResponse {
  status: string;
  mensagem: string;
  protocolo: string;
}

export interface PedidoStatus {
  protocolo: string;
  liveId: string;
  usuarioId: string;
  quantidade: number;
  status: StatusPedido;
  mensagem: string;
}

// Monta uma mensagem de erro com o código HTTP e, se existir, o texto devolvido pelo backend
async function erroDaResposta(res: Response, padrao: string): Promise<Error> {
  let detalhe = '';
  try {
    const corpo = await res.json();
    detalhe = corpo?.mensagem ?? corpo?.erro ?? corpo?.message ?? '';
  } catch {
    // resposta sem corpo JSON
  }
  return new Error(`${padrao} (HTTP ${res.status})${detalhe ? `: ${detalhe}` : ''}`);
}

// POST /vendas/comprar -> responde 202 com o protocolo e status PROCESSANDO
export async function comprarIngresso(
  liveId: string,
  usuarioId: string,
  quantidade: number,
): Promise<CompraResponse> {
  const res = await fetch('/api/vendas/comprar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ liveId, usuarioId, quantidade }),
  });

  if (!res.ok) throw await erroDaResposta(res, 'Erro ao processar a solicitação de compra');
  return res.json();
}

// GET /vendas/pedidos/{protocolo}
export async function consultarPedido(protocolo: string): Promise<PedidoStatus> {
  const res = await fetch(`/api/vendas/pedidos/${encodeURIComponent(protocolo)}`, {
    credentials: 'include',
  });

  if (!res.ok) throw await erroDaResposta(res, 'Erro ao consultar o status do pedido');
  return res.json();
}