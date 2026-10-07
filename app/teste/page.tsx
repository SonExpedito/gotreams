'use client';

import { useState, type ReactNode } from 'react';
import { useAuth } from '@/app/AuthContext';

const campo =
  'min-w-0 flex-1 basis-36 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm placeholder:text-stone-400 focus:border-rose-600 focus:outline-2 focus:outline-rose-600/30';
const btn =
  'rounded-md bg-stone-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900';
const btnClaro =
  'rounded-md border border-stone-300 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100';

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5">
      <h2 className="mb-3 text-base font-semibold">{titulo}</h2>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </section>
  );
}

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
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-8 sm:py-12">
        <header className="mb-2">
          <h1 className="text-3xl font-bold tracking-tight">Painel de testes</h1>
          <p className="mt-2 text-sm text-stone-600">
            Sessão:{' '}
            {usuario ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-medium text-emerald-800">
                {usuario.nome} ({usuario.usuarioId})
              </span>
            ) : (
              <span className="rounded-full bg-stone-200 px-2.5 py-0.5 font-medium text-stone-700">deslogado</span>
            )}
          </p>
        </header>

        <Secao titulo="Login (porta 8083)">
          <input className={campo} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" />
          <input className={campo} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" />
          <input className={campo} value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Senha" />
          <div className="flex w-full gap-2">
            <button className={btn} onClick={() => chamar('registro', '/api/auth/registro', { nome, email, senha })}>Registrar</button>
            <button className={btn} onClick={() => chamar('login', '/api/auth/login', { email, senha })}>Login</button>
            <button className={btnClaro} onClick={() => chamar('me', '/api/auth/me')}>/me</button>
          </div>
        </Secao>

        <Secao titulo="Lives (porta 8081)">
          <input className={campo} value={live.titulo} onChange={(e) => setLive({ ...live, titulo: e.target.value })} placeholder="Título" />
          <input className={campo} value={live.descricao} onChange={(e) => setLive({ ...live, descricao: e.target.value })} placeholder="Descrição" />
          <input className={campo} type="number" value={live.precoIngresso} onChange={(e) => setLive({ ...live, precoIngresso: Number(e.target.value) })} placeholder="Preço" />
          <input className={campo} type="number" value={live.capacidadeMaxima} onChange={(e) => setLive({ ...live, capacidadeMaxima: Number(e.target.value) })} placeholder="Capacidade" />
          <div className="flex w-full gap-2">
            <button className={btn} onClick={() => chamar('criar live', '/api/lives', live)}>Criar live</button>
            <button className={btnClaro} onClick={() => chamar('listar lives', '/api/lives')}>Listar</button>
            <button className={btnClaro} onClick={() => chamar('obter live', `/api/lives/${liveId}`)}>Obter por id</button>
          </div>
        </Secao>

        <Secao titulo="Vendas (porta 8082 → fila → produto)">
          <input className={campo} value={liveId} onChange={(e) => setLiveId(e.target.value)} placeholder="liveId" />
          <input className={`${campo} basis-24 flex-none`} type="number" min={1} value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} />
          <button className={btn} onClick={() => chamar('comprar', '/api/vendas/comprar', { liveId, usuarioId: usuario?.usuarioId, quantidade })}>Comprar</button>
          <input className={campo} value={protocolo} onChange={(e) => setProtocolo(e.target.value)} placeholder="protocolo" />
          <button className={btnClaro} onClick={() => chamar('pedido', `/api/vendas/pedidos/${protocolo}`)}>Consultar pedido</button>
        </Secao>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-semibold">Resultado <span className="font-normal text-stone-500">(mais recente primeiro)</span></h2>
            <button className={btnClaro} onClick={() => setLog([])}>Limpar</button>
          </div>
          {log.length === 0 ? (
            <p className="rounded-lg border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500">
              Nenhuma chamada ainda.
            </p>
          ) : (
            <div className="space-y-2">
              {log.map((l, i) => (
                <pre key={i} className="overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-stone-900 p-3 font-mono text-xs text-stone-100">
                  {l}
                </pre>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}