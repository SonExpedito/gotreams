'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { obterLive, type Live } from '@/api/lives';
import { comprarIngresso } from '@/api/vendas';
import { useAuth } from '@/app/Authcontext';

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

  return (
    <main>
      <button onClick={() => router.push('/')}>← Voltar</button>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      {!live && !erro && <p>Carregando...</p>}
      {live && (
        <>
          <h1>{live.titulo}</h1>
          <p>{live.descricao}</p>
          <p>R$ {Number(live.precoIngresso).toFixed(2)} — {live.capacidadeMaxima} vagas</p>
          <input type="number" min={1} value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} />{' '}
          <button onClick={comprar} disabled={comprando || carregandoSessao}>
            {usuario ? (comprando ? 'Enviando...' : 'Comprar') : 'Entrar para comprar'}
          </button>
        </>
      )}
    </main>
  );
}