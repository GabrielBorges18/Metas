// Tipos do Sistema de Metas

export type TipoMeta = "Profissional" | "Pessoal" | "Estudos" | "Saúde" | "Outro";

export type StatusMetaGrande = "ativa" | "concluída" | "pausada";

export type StatusMetaPequena = "pendente" | "concluída";

export interface User {
  id: string;
  nome: string;
  email: string;
  senha?: string; // Apenas para validação, não armazenar em produção
}

export interface MetaPequena {
  id: string;
  titulo: string;
  status: StatusMetaPequena;
}

export interface MetaGrande {
  id: string;
  userId: string;
  tipo: TipoMeta;
  titulo: string;
  descricao?: string;
  status: StatusMetaGrande;
  metasPequenas: MetaPequena[];
  dataInicio: string; // ISO date string
  dataPrazo?: string; // ISO date string (opcional)
}

export interface Group {
  id: string;
  nome: string;
  descricao: string;
  codigoConvite: string;
  criadorId: string;
  membrosIds: string[];
  createdAt: string; // ISO date string
}
