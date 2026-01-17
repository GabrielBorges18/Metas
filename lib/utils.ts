// Funções utilitárias
import { MetaGrande, MetaPequena } from "./types";

export function calcularProgresso(meta: MetaGrande | { metasPequenas: Array<{ status: string }> }): number {
  if (meta.metasPequenas.length === 0) return 0;
  const concluidas = meta.metasPequenas.filter((m) => m.status === "concluída").length;
  return Math.round((concluidas / meta.metasPequenas.length) * 100);
}

export function formatarData(data: string): string {
  return new Date(data).toLocaleDateString("pt-BR");
}

export function obterCorTipo(tipo: string): string {
  const cores: Record<string, string> = {
    Profissional: "bg-blue-100 text-blue-800 border-blue-200",
    Pessoal: "bg-purple-100 text-purple-800 border-purple-200",
    Estudos: "bg-green-100 text-green-800 border-green-200",
    Saúde: "bg-red-100 text-red-800 border-red-200",
    Outro: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return cores[tipo] || cores.Outro;
}
