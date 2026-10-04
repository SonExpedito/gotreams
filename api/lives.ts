export interface Live {
  id: string;
  titulo: string;
  descricao: string;
  precoIngresso: number;
  capacidadeMaxima: number;
}

export type NovaLive = Omit<Live, 'id'>;

export async function listarLives(): Promise<Live[]> {
  const res = await fetch('/api/lives');
  if (!res.ok) throw new Error(`Erro ao carregar as lives (HTTP ${res.status}).`);
  return res.json();
}

export async function obterLive(id: string): Promise<Live> {
  const res = await fetch(`/api/lives/${id}`);
  if (!res.ok) throw new Error(`Erro ao carregar a live (HTTP ${res.status}).`);
  return res.json();
}

// POST /lives no serviço produto
export async function criarLive(dados: NovaLive): Promise<Live> {
  const res = await fetch('/api/lives', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error(`Erro ao criar a live (HTTP ${res.status}).`);
  return res.json();
}