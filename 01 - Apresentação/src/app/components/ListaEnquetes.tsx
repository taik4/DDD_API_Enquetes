import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, Eye, Edit, Trash2, BarChart3, Play, StopCircle, Info } from 'lucide-react';
import { Button } from './ui/button';
import { enqueteService } from '../services/enquete-service';
import type { Enquete } from '../types/enquete';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

type FiltroStatus = 'Todas' | 'Rascunho' | 'Publicada' | 'Encerrada';

export function ListaEnquetes() {
  const [enquetes, setEnquetes] = useState<Enquete[]>([]);
  const [filtro, setFiltro] = useState<FiltroStatus>('Todas');
  const [loading, setLoading] = useState(true);
  const [resultadosEnquetes, setResultadosEnquetes] = useState<Record<string, any>>({});

  useEffect(() => {
    carregarEnquetes();
  }, []);

  const carregarEnquetes = async () => {
    try {
      setLoading(true);
      const data = await enqueteService.obterTodas();
      setEnquetes(data);
      
      // Carregar resultados para cada enquete
      const resultados: Record<string, any> = {};
      for (const enquete of data) {
        try {
          const resultado = await enqueteService.obterResultados(enquete.id);
          resultados[enquete.id] = resultado;
        } catch (error) {
          console.error(`Erro ao carregar resultado da enquete ${enquete.id}`, error);
        }
      }
      setResultadosEnquetes(resultados);
    } catch (error) {
      toast.error('Erro ao carregar enquetes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const enquetesFiltradas = enquetes.filter(
    (e) => filtro === 'Todas' || e.status === filtro
  );

  const handlePublicar = async (id: string) => {
    try {
      await enqueteService.publicar(id);
      toast.success('Enquete publicada com sucesso!');
      await carregarEnquetes();
    } catch (error) {
      toast.error('Erro ao publicar enquete');
    }
  };

  const handleEncerrar = async (id: string) => {
    try {
      await enqueteService.encerrar(id);
      toast.success('Enquete encerrada com sucesso!');
      await carregarEnquetes();
    } catch (error) {
      toast.error('Erro ao encerrar enquete');
    }
  };

  const handleRemover = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta enquete?')) return;
    
    try {
      await enqueteService.remover(id);
      toast.success('Enquete removida com sucesso!');
      await carregarEnquetes();
    } catch (error) {
      toast.error('Erro ao remover enquete');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Rascunho':
        return 'bg-orange-500';
      case 'Publicada':
        return 'bg-green-500';
      case 'Encerrada':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Banner de Modo Mock */}
        <motion.div
          className="mb-6 rounded-xl bg-blue-950 border border-blue-900 p-4 flex items-start gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-blue-200 mb-1">
              Modo de Desenvolvimento Ativo
            </p>
            <p className="text-blue-300">
              Usando dados mock locais. Para conectar à sua API ASP.NET, clique no botão de configurações no canto inferior direito.
            </p>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mb-6 text-5xl font-bold text-fuchsia-500">ENQUETES</h1>
          <Link to="/criar">
            <Button className="rounded-full bg-fuchsia-600 px-6 py-2 font-bold hover:bg-fuchsia-700">
              CREATE A POLL
            </Button>
          </Link>
        </motion.div>

        {/* Filtros */}
        <motion.div
          className="mb-8 flex gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {(['Todas', 'Rascunho', 'Publicada', 'Encerrada'] as FiltroStatus[]).map((status) => (
            <motion.button
              key={status}
              onClick={() => setFiltro(status)}
              className={`rounded-full px-6 py-2 font-semibold transition-colors ${
                filtro === status
                  ? 'bg-fuchsia-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {status}
            </motion.button>
          ))}
        </motion.div>

        {/* Título da Seção */}
        <h2 className="mb-6 text-2xl font-bold">Todas as Enquetes</h2>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-neutral-400">
            Carregando enquetes...
          </div>
        )}

        {/* Grid de Enquetes */}
        {!loading && enquetesFiltradas.length === 0 && (
          <div className="text-center py-12 text-neutral-400">
            Nenhuma enquete encontrada
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enquetesFiltradas.map((enquete, index) => {
            const resultado = resultadosEnquetes[enquete.id];
            
            return (
              <motion.div
                key={enquete.id}
                className="rounded-2xl bg-neutral-900 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(217, 70, 239, 0.2)' }}
              >
                {/* ID e Status */}
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">
                    ID: {enquete.id.slice(0, 8)}...
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                      enquete.status
                    )}`}
                  >
                    {enquete.status}
                  </span>
                </div>

                {/* Pergunta */}
                <h3 className="mb-4 text-lg font-bold">{enquete.pergunta}</h3>

                {/* Opções com Porcentagens */}
                <div className="mb-4 space-y-2">
                  {enquete.opcoes.map((opcao, opcaoIndex) => {
                    const opcaoResultado = resultado?.resultados.find((r: any) => r.texto === opcao);
                    const percentual = opcaoResultado?.percentual || 0;
                    
                    return (
                      <div
                        key={opcaoIndex}
                        className="relative overflow-hidden rounded-lg bg-neutral-800"
                      >
                        {/* Barra de progresso */}
                        <motion.div
                          className="absolute inset-0 bg-fuchsia-600/20"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentual}%` }}
                          transition={{ duration: 0.8, delay: index * 0.05 + opcaoIndex * 0.1 }}
                        />
                        
                        <div className="relative flex items-center justify-between px-4 py-2">
                          <span className="flex items-center gap-2">
                            <span className="text-fuchsia-500">{opcaoIndex + 1}.</span>
                            <span className="text-sm">{opcao}</span>
                          </span>
                          <span className="text-xs font-semibold text-fuchsia-400">
                            {percentual}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total de Votos */}
                <div className="mb-4 text-sm text-neutral-400">
                  Total de votos: {enquete.totalVotos}
                </div>

                {/* Ações */}
                <div className="flex flex-wrap gap-2">
                  {enquete.status === 'Rascunho' && (
                    <Button
                      size="sm"
                      onClick={() => handlePublicar(enquete.id)}
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                    >
                      <Play className="mr-1 h-4 w-4" />
                      Publicar
                    </Button>
                  )}
                  
                  {enquete.status === 'Publicada' && (
                    <Button
                      size="sm"
                      onClick={() => handleEncerrar(enquete.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      <StopCircle className="mr-1 h-4 w-4" />
                      Encerrar
                    </Button>
                  )}

                  <Link to={`/votar/${enquete.id}`} className="flex-1">
                    <Button size="sm" variant="secondary" className="w-full bg-neutral-700 hover:bg-neutral-600">
                      <Eye className="mr-1 h-4 w-4" />
                      Ver
                    </Button>
                  </Link>

                  <Link to={`/editar/${enquete.id}`}>
                    <Button size="sm" variant="secondary" className="bg-fuchsia-600 hover:bg-fuchsia-700">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>

                  <Link to={`/resultados/${enquete.id}`}>
                    <Button size="sm" variant="secondary" className="bg-blue-600 hover:bg-blue-700">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemover(enquete.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}