import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from './ui/button';
import { enqueteService } from '../services/enquete-service';
import type { Enquete } from '../types/enquete';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function VotarEnquete() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [enquete, setEnquete] = useState<Enquete | null>(null);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (id) {
      carregarEnquete();
    }
  }, [id]);

  const carregarEnquete = async () => {
    try {
      setLoading(true);
      const data = await enqueteService.obterPorId(id!);
      setEnquete(data);
    } catch (error) {
      toast.error('Erro ao carregar enquete');
      console.error(error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleVotar = async () => {
    if (!opcaoSelecionada) {
      toast.error('Por favor, selecione uma opção');
      return;
    }

    if (enquete?.status !== 'Publicada') {
      toast.error('Esta enquete não está disponível para votação');
      return;
    }

    try {
      setVoting(true);
      // Gera um participanteId aleatório a cada voto
      const participanteIdAleatorio = crypto.randomUUID();
      await enqueteService.votar(id!, {
        participanteId: participanteIdAleatorio,
        opcaoTexto: opcaoSelecionada,
      });
      toast.success('Voto registrado com sucesso!');
      navigate(`/resultados/${id}`);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao registrar voto');
      console.error(error);
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-neutral-400">Carregando...</div>
      </div>
    );
  }

  if (!enquete) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-fuchsia-500 hover:text-fuchsia-400"
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-semibold">Voltar</span>
        </motion.button>

        {/* Pergunta */}
        <motion.h1
          className="mb-8 text-center text-3xl font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {enquete.pergunta}
        </motion.h1>

        {/* Opções */}
        <div className="mb-8 space-y-3">
          {enquete.opcoes.map((opcao, index) => (
            <motion.button
              key={index}
              onClick={() => setOpcaoSelecionada(opcao)}
              className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                opcaoSelecionada === opcao
                  ? 'border-fuchsia-500 bg-fuchsia-950'
                  : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-fuchsia-600 text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="font-medium">{opcao}</span>
                </span>
                {opcaoSelecionada === opcao && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Check className="h-5 w-5 text-fuchsia-500" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Total de Votos */}
        <motion.div
          className="mb-6 text-center text-sm text-neutral-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {enquete.totalVotos} votos
        </motion.div>

        {/* Botão de Votar */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={handleVotar}
            disabled={!opcaoSelecionada || voting || enquete.status !== 'Publicada'}
            className={`px-12 ${
              opcaoSelecionada && enquete.status === 'Publicada'
                ? 'bg-fuchsia-600 hover:bg-fuchsia-700'
                : 'bg-neutral-700'
            }`}
          >
            {voting ? 'Votando...' : 'Vote'}
          </Button>
        </motion.div>

        {enquete.status !== 'Publicada' && (
          <motion.div
            className="mt-4 text-center text-sm text-red-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Esta enquete está {enquete.status.toLowerCase()} e não aceita votos
          </motion.div>
        )}
      </div>
    </div>
  );
}