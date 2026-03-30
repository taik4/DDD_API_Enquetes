import type { Enquete, CriarEnqueteDTO, EditarEnqueteDTO, VotarDTO, ResultadoEnquete } from '../types/enquete';

// Configure a URL base da sua API aqui - usando variáveis de ambiente
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7025/api/enquetes';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10);

// Modo de desenvolvimento com dados mock (ative quando a API não estiver disponível)
let USE_MOCK_DATA = (() => {
  const envValue = import.meta.env.VITE_USE_MOCK_DATA;
  return envValue === 'true' ? true : false;
})();

// Dados mock para desenvolvimento
let mockEnquetes: Enquete[] = [
  {
    id: 'ead0eecd-86d9-4aa4-8862-388457617fcf',
    pergunta: 'Qual é a mulher mais bonita do mundo?',
    status: 'Encerrada',
    prazoInicio: '2026-03-29T02:58:59.237',
    prazoFim: '2026-03-29T02:58:59.237',
    opcoes: ['AnaLice', 'Mãe', 'Irmã'],
    totalVotos: 4,
    prazoAtivo: false,
  },
  {
    id: 'f1234567-1234-1234-1234-123456789abc',
    pergunta: 'Qual é o melhor framework?',
    status: 'Publicada',
    prazoInicio: '2026-03-20T10:00:00.000',
    prazoFim: '2026-04-20T10:00:00.000',
    opcoes: ['Asp', 'Vue', 'Angular', 'Svelte'],
    totalVotos: 15,
    prazoAtivo: true,
  },
  {
    id: 'a9876543-4321-4321-4321-9876543210ab',
    pergunta: 'Melhor linguagem de programação backend?',
    status: 'Rascunho',
    prazoInicio: '2026-04-01T08:00:00.000',
    prazoFim: '2026-05-01T08:00:00.000',
    opcoes: ['C#', 'assembly', 'Python', 'Java'],
    totalVotos: 0,
    prazoAtivo: false,
  },
  {
    id: 'b1234567-5678-9012-3456-789012345678',
    pergunta: 'Qual é a melhor IDE para desenvolvimento?',
    status: 'Encerrada',
    prazoInicio: '2026-02-01T09:00:00.000',
    prazoFim: '2026-03-01T09:00:00.000',
    opcoes: ['VS Code', 'IntelliJ IDEA', 'Visual Studio', 'Sublime Text'],
    totalVotos: 42,
    prazoAtivo: false,
  },
];

const mockResultados: Record<string, ResultadoEnquete> = {
  'ead0eecd-86d9-4aa4-8862-388457617fcf': {
    enqueteId: 'ead0eecd-86d9-4aa4-8862-388457617fcf',
    pergunta: 'Qual é a mulher mais linda do mundo?',
    status: 'Encerrada',
    totalVotos: 4,
    resultados: [
      { texto: 'AnaLice', totalVotos: 4, percentual: 100 },
      { texto: 'Mãe', totalVotos: 0, percentual: 0 },
      { texto: 'Irmã', totalVotos: 0, percentual: 0 },
    ],
  },
  'f1234567-1234-1234-1234-123456789abc': {
    enqueteId: 'f1234567-1234-1234-1234-123456789abc',
    pergunta: 'Qual é o melhor framework JavaScript?',
    status: 'Publicada',
    totalVotos: 15,
    resultados: [
      { texto: 'React', totalVotos: 8, percentual: 53 },
      { texto: 'Vue', totalVotos: 4, percentual: 27 },
      { texto: 'Angular', totalVotos: 2, percentual: 13 },
      { texto: 'Svelte', totalVotos: 1, percentual: 7 },
    ],
  },
  'b1234567-5678-9012-3456-789012345678': {
    enqueteId: 'b1234567-5678-9012-3456-789012345678',
    pergunta: 'Qual é a melhor IDE para desenvolvimento?',
    status: 'Encerrada',
    totalVotos: 42,
    resultados: [
      { texto: 'VS Code', totalVotos: 25, percentual: 60 },
      { texto: 'IntelliJ IDEA', totalVotos: 10, percentual: 24 },
      { texto: 'Visual Studio', totalVotos: 5, percentual: 12 },
      { texto: 'Sublime Text', totalVotos: 2, percentual: 4 },
    ],
  },
};

class EnqueteService {
  private async fetcher<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.erro || `Erro HTTP ${response.status}: ${response.statusText}`);
      }

      // Para respostas 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro na requisição à API:', errorMessage);
      console.warn('⚠️ Caindo para dados mock...');
      USE_MOCK_DATA = true;
      throw error;
    }
  }

  // Mock helpers
  private delay(ms: number = 500) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async obterTodas(): Promise<Enquete[]> {
    if (USE_MOCK_DATA) {
      await this.delay();
      return [...mockEnquetes];
    }
    try {
      return await this.fetcher<Enquete[]>('');
    } catch (error) {
      console.warn('⚠️ Fallback para dados mock');
      USE_MOCK_DATA = true;
      await this.delay();
      return [...mockEnquetes];
    }
  }

  async obterPorId(id: string): Promise<Enquete> {
    if (USE_MOCK_DATA) {
      await this.delay();
      const enquete = mockEnquetes.find((e) => e.id === id);
      if (!enquete) throw new Error('Enquete não encontrada');
      return { ...enquete };
    }
    try {
      return await this.fetcher<Enquete>(`/${id}`);
    } catch (error) {
      console.warn('⚠️ Fallback para dados mock');
      USE_MOCK_DATA = true;
      await this.delay();
      const enquete = mockEnquetes.find((e) => e.id === id);
      if (!enquete) throw new Error('Enquete não encontrada');
      return { ...enquete };
    }
  }

  async criar(dto: CriarEnqueteDTO): Promise<void> {
    if (USE_MOCK_DATA) {
      await this.delay();
      const novaEnquete: Enquete = {
        id: crypto.randomUUID(),
        pergunta: dto.pergunta,
        status: 'Rascunho',
        prazoInicio: dto.prazoInicio,
        prazoFim: dto.prazoFim,
        opcoes: dto.opcoes,
        totalVotos: 0,
        prazoAtivo: false,
      };
      mockEnquetes.push(novaEnquete);
      return;
    }
    try {
      await this.fetcher('', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    } catch (error) {
      console.warn('⚠️ Fallback para dados mock em criar()');
      USE_MOCK_DATA = true;
      const novaEnquete: Enquete = {
        id: crypto.randomUUID(),
        pergunta: dto.pergunta,
        status: 'Rascunho',
        prazoInicio: dto.prazoInicio,
        prazoFim: dto.prazoFim,
        opcoes: dto.opcoes,
        totalVotos: 0,
        prazoAtivo: false,
      };
      mockEnquetes.push(novaEnquete);
    }
  }

  async editar(id: string, dto: EditarEnqueteDTO): Promise<void> {
    if (USE_MOCK_DATA) {
      await this.delay();
      const index = mockEnquetes.findIndex((e) => e.id === id);
      if (index === -1) throw new Error('Enquete não encontrada');
      
      const enquete = mockEnquetes[index];
      if (enquete.status === 'Encerrada') {
        throw new Error('Enquetes encerradas não podem ser editadas');
      }
      
      mockEnquetes[index] = {
        ...enquete,
        pergunta: dto.pergunta,
        prazoInicio: dto.prazoInicio,
        prazoFim: dto.prazoFim,
        opcoes: dto.opcoes,
      };
      return;
    }
    try {
      await this.fetcher(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dto),
      });
    } catch (error) {
      console.warn('⚠️ Fallback para dados mock em editar()');
      USE_MOCK_DATA = true;
      const index = mockEnquetes.findIndex((e) => e.id === id);
      if (index === -1) throw new Error('Enquete não encontrada');
      
      const enquete = mockEnquetes[index];
      if (enquete.status === 'Encerrada') {
        throw new Error('Enquetes encerradas não podem ser editadas');
      }
      
      mockEnquetes[index] = {
        ...enquete,
        pergunta: dto.pergunta,
        prazoInicio: dto.prazoInicio,
        prazoFim: dto.prazoFim,
        opcoes: dto.opcoes,
      };
    }
  }

  async remover(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await this.delay();
      mockEnquetes = mockEnquetes.filter((e) => e.id !== id);
      return;
    }
    try {
      await this.fetcher(`/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('⚠️ Fallback para dados mock em remover()');
      USE_MOCK_DATA = true;
      mockEnquetes = mockEnquetes.filter((e) => e.id !== id);
    }
  }

  async obterResultados(id: string): Promise<ResultadoEnquete> {
    if (USE_MOCK_DATA) {
      await this.delay();
      const resultado = mockResultados[id];
      if (resultado) {
        return { ...resultado };
      }
      
      const enquete = mockEnquetes.find((e) => e.id === id);
      if (!enquete) throw new Error('Enquete não encontrada');
      
      return {
        enqueteId: enquete.id,
        pergunta: enquete.pergunta,
        status: enquete.status,
        totalVotos: enquete.totalVotos,
        resultados: enquete.opcoes.map((opcao) => ({
          texto: opcao,
          totalVotos: 0,
          percentual: 0,
        })),
      };
    }
    try {
      return await this.fetcher<ResultadoEnquete>(`/${id}/resultados`);
    } catch (error) {
      console.warn('⚠️ Fallback para dados mock em obterResultados()');
      USE_MOCK_DATA = true;
      await this.delay();
      
      const resultado = mockResultados[id];
      if (resultado) {
        return { ...resultado };
      }
      
      const enquete = mockEnquetes.find((e) => e.id === id);
      if (!enquete) throw new Error('Enquete não encontrada');
      
      return {
        enqueteId: enquete.id,
        pergunta: enquete.pergunta,
        status: enquete.status,
        totalVotos: enquete.totalVotos,
        resultados: enquete.opcoes.map((opcao) => ({
          texto: opcao,
          totalVotos: 0,
          percentual: 0,
        })),
      };
    }
  }

  async publicar(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await this.delay();
      const enquete = mockEnquetes.find((e) => e.id === id);
      if (enquete) {
        enquete.status = 'Publicada';
        enquete.prazoAtivo = true;
      }
      return;
    }
    try {
      await this.fetcher(`/${id}/publicar`, {
        method: 'PATCH',
      });
    } catch (error) {
      console.warn('⚠️ Fallback para dados mock em publicar()');
      USE_MOCK_DATA = true;
      const enquete = mockEnquetes.find((e) => e.id === id);
      if (enquete) {
        enquete.status = 'Publicada';
        enquete.prazoAtivo = true;
      }
    }
  }

  async encerrar(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await this.delay();
      const enquete = mockEnquetes.find((e) => e.id === id);
      if (enquete) {
        enquete.status = 'Encerrada';
        enquete.prazoAtivo = false;
      }
      return;
    }
    try {
      await this.fetcher(`/${id}/encerrar`, {
        method: 'PATCH',
      });
    } catch (error) {
      console.warn('⚠️ Fallback para dados mock em encerrar()');
      USE_MOCK_DATA = true;
      const enquete = mockEnquetes.find((e) => e.id === id);
      if (enquete) {
        enquete.status = 'Encerrada';
        enquete.prazoAtivo = false;
      }
    }
  }

  async votar(id: string, dto: VotarDTO): Promise<void> {
    if (USE_MOCK_DATA) {
      await this.delay();
      const enquete = mockEnquetes.find((e) => e.id === id);
      if (!enquete) throw new Error('Enquete não encontrada');
      if (enquete.status !== 'Publicada') {
        throw new Error('Esta enquete não está disponível para votação');
      }
      
      enquete.totalVotos += 1;
      
      if (!mockResultados[id]) {
        mockResultados[id] = {
          enqueteId: id,
          pergunta: enquete.pergunta,
          status: enquete.status,
          totalVotos: enquete.totalVotos,
          resultados: enquete.opcoes.map((opcao) => ({
            texto: opcao,
            totalVotos: opcao === dto.opcaoTexto ? 1 : 0,
            percentual: opcao === dto.opcaoTexto ? 100 : 0,
          })),
        };
      } else {
        const resultado = mockResultados[id];
        resultado.totalVotos += 1;
        
        const opcaoResultado = resultado.resultados.find(
          (r) => r.texto === dto.opcaoTexto
        );
        if (opcaoResultado) {
          opcaoResultado.totalVotos += 1;
        }
        
        resultado.resultados.forEach((r) => {
          r.percentual = Math.round((r.totalVotos / resultado.totalVotos) * 100);
        });
      }
      
      return;
    }
    try {
      await this.fetcher(`/${id}/votar`, {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    } catch (error) {
      console.warn('⚠️ Fallback para dados mock em votar()');
      USE_MOCK_DATA = true;
      const enquete = mockEnquetes.find((e) => e.id === id);
      if (!enquete) throw new Error('Enquete não encontrada');
      if (enquete.status !== 'Publicada') {
        throw new Error('Esta enquete não está disponível para votação');
      }
      
      enquete.totalVotos += 1;
      
      if (!mockResultados[id]) {
        mockResultados[id] = {
          enqueteId: id,
          pergunta: enquete.pergunta,
          status: enquete.status,
          totalVotos: enquete.totalVotos,
          resultados: enquete.opcoes.map((opcao) => ({
            texto: opcao,
            totalVotos: opcao === dto.opcaoTexto ? 1 : 0,
            percentual: opcao === dto.opcaoTexto ? 100 : 0,
          })),
        };
      } else {
        const resultado = mockResultados[id];
        resultado.totalVotos += 1;
        
        const opcaoResultado = resultado.resultados.find(
          (r) => r.texto === dto.opcaoTexto
        );
        if (opcaoResultado) {
          opcaoResultado.totalVotos += 1;
        }
        
        resultado.resultados.forEach((r) => {
          r.percentual = Math.round((r.totalVotos / resultado.totalVotos) * 100);
        });
      }
    }
  }
}

export const enqueteService = new EnqueteService();

// Função para obter status atual
export function getUseMockData(): boolean {
  return USE_MOCK_DATA;
}

// Função helper para alternar entre mock e API real
export function setUseMockData(useMock: boolean) {
  USE_MOCK_DATA = useMock;
  console.log(`Modo mock data alterado para: ${useMock}`);
  if (useMock) {
    console.log('✅ Usando DADOS MOCK (desenvolvimento)');
  } else {
    console.log('🔗 Conectando à API REAL em:', API_BASE_URL);
  }
}

// Função para obter URL da API
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}