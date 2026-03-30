export interface Enquete {
  id: string;
  pergunta: string;
  status: 'Rascunho' | 'Publicada' | 'Encerrada';
  prazoInicio: string;
  prazoFim: string;
  opcoes: string[];
  totalVotos: number;
  prazoAtivo: boolean;
}

export interface CriarEnqueteDTO {
  pergunta: string;
  prazoInicio: string;
  prazoFim: string;
  opcoes: string[];
}

export interface EditarEnqueteDTO {
  pergunta: string;
  prazoInicio: string;
  prazoFim: string;
  opcoes: string[];
}

export interface VotarDTO {
  participanteId: string;
  opcaoTexto: string;
}

export interface ResultadoOpcao {
  texto: string;
  totalVotos: number;
  percentual: number;
}

export interface ResultadoEnquete {
  enqueteId: string;
  pergunta: string;
  status: string;
  totalVotos: number;
  resultados: ResultadoOpcao[];
}
