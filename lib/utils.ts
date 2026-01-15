// Funções utilitárias
import { MetaGrande, MetaPequena } from "./types";

export function calcularProgresso(meta: MetaGrande): number {
  if (meta.metasPequenas.length === 0) return 0;
  const concluidas = meta.metasPequenas.filter((m) => m.status === "concluída").length;
  return Math.round((concluidas / meta.metasPequenas.length) * 100);
}

export function formatarData(data: string): string {
  return new Date(data).toLocaleDateString("pt-BR");
}

export function obterCorTipo(tipo: string): string {
  const cores: Record<string, string> = {
    Profissional: "bg-blue-900/50 text-blue-300 border-blue-700",
    Pessoal: "bg-purple-900/50 text-purple-300 border-purple-700",
    Estudos: "bg-green-900/50 text-green-300 border-green-700",
    Saúde: "bg-red-900/50 text-red-300 border-red-700",
    Outro: "bg-gray-700 text-gray-300 border-gray-600",
  };
  return cores[tipo] || cores.Outro;
}
