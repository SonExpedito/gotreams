'use client';

// Painel de diagnóstico: chama cada endpoint e mostra status HTTP e corpo CRUS.
import { useState } from 'react';
import { useAuth } from '@/app/Authcontext';

export default function TestePage() {
  const { usuario } = useAuth();
  const [log, setLog] = useState<string[]>([]);
  const [nome, setNome] = useState('Teste');
  const [email, setEmail] = useState('teste@teste.com');
  const [senha, setSenha] = useState('123456');
  const [live, setLive] = useState({ titulo: 'Live de teste', descricao: 'Descrição', precoIngresso: 10, capacidadeMaxima: 3 });
  const [liveId, setLiveId] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [protocolo, setProtocolo] = useState('');

  async function chamar(rotulo: string, url: string, corpo?: unknown) {
    const metodo = corpo === undefined ? 'GET' : 'POST';
    const ini = performance.now();
    let texto: string;
    try {
      const res = await fetch(url, {
        method: metodo,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: corpo === undefined ? undefined : JSON.stringify(corpo),
      });
      texto = await res.text();
      setLog((l) => [`[${rotulo}] ${metodo} ${url} -> ${res.status} (${Math.round(performance.now() - ini)}ms)\n${texto}`, ...l]);
    } catch (e) {
      setLog((l) => [`[${rotulo}] ${metodo} ${url} -> FALHOU: ${String(e)}`, ...l]);
      return;
    }
    // Preenche os campos com o que voltou, para encadear os testes
    try {
      const j = JSON.parse(texto);
      if (Array.isArray(j) && j[0]?.id) setLiveId(String(j[0].id));
      else if (j?.id) setLiveId(String(j.id));
      if (j?.protocolo) setProtocolo(j.protocolo);
    } catch { /* corpo não é JSON */ }
  }

  return (
    <main>
      <h1>Painel de testes</h1>
      <p>Sessão: {usuario ? `${usuario.nome} (${usuario.usuarioId})` : 'deslogado'}</p>

      <h2>1. Login (porta 8083)</h2>
      <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="nome" />{' '}
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />{' '}
      <input value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="senha" />{' '}
      <button onClick={() => chamar('registro', '/api/auth/registro', { nome, email, senha })}>Registrar</button>{' '}
      <button onClick={() => chamar('login', '/api/auth/login', { email, senha })}>Login</button>{' '}
      <button onClick={() => chamar('me', '/api/auth/me')}>/me</button>

      <h2>2. Lives (porta 8081)</h2>
      <input value={live.titulo} onChange={(e) => setLive({ ...live, titulo: e.target.value })} />{' '}
      <input value={live.descricao} onChange={(e) => setLive({ ...live, descricao: e.target.value })} />{' '}
      <input type="number" value={live.precoIngresso} onChange={(e) => setLive({ ...live, precoIngresso: Number(e.target.value) })} />{' '}
      <input type="number" value={live.capacidadeMaxima} onChange={(e) => setLive({ ...live, capacidadeMaxima: Number(e.target.value) })} />{' '}
      <button onClick={() => chamar('criar live', '/api/lives', live)}>Criar live</button>{' '}
      <button onClick={() => chamar('listar lives', '/api/lives')}>Listar</button>{' '}
      <button onClick={() => chamar('obter live', `/api/lives/${liveId}`)}>Obter por id</button>

      <h2>3. Vendas (porta 8082 → fila → produto)</h2>
      <input value={liveId} onChange={(e) => setLiveId(e.target.value)} placeholder="liveId" />{' '}
      <input type="number" min={1} value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} />{' '}
      <button onClick={() => chamar('comprar', '/api/vendas/comprar', { liveId, usuarioId: usuario?.usuarioId, quantidade })}>Comprar</button>{' '}
      <input value={protocolo} onChange={(e) => setProtocolo(e.target.value)} placeholder="protocolo" />{' '}
      <button onClick={() => chamar('pedido', `/api/vendas/pedidos/${protocolo}`)}>Consultar pedido</button>

      <h2>Resultado (mais recente primeiro) <button onClick={() => setLog([])}>limpar</button></h2>
      {log.map((l, i) => (
        <pre key={i} style={{ whiteSpace: 'pre-wrap', borderTop: '1px solid #999' }}>{l}</pre>
      ))}
    </main>
  );
}