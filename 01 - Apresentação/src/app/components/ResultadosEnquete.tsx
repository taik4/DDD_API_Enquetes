import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, TrendingUp, Trophy, Sparkles, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { enqueteService } from '../services/enquete-service';
import type { ResultadoEnquete } from '../types/enquete';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export function ResultadosEnquete() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resultado, setResultado] = useState<ResultadoEnquete | null>(null);
  const [loading, setLoading] = useState(true);
  const [mostrandoVencedor, setMostrandoVencedor] = useState(false);
  const [mostrarTopTier, setMostrarTopTier] = useState(false);

  useEffect(() => {
    if (id) {
      setMostrarTopTier(false);
      setMostrandoVencedor(false);
      carregarResultados();
    }
  }, [id]);

  const carregarResultados = async () => {
    try {
      setLoading(true);
      const data = await enqueteService.obterResultados(id!);
      setResultado(data);
      
      // Se a enquete está encerrada e tem votos, mostrar top tier
      if (data.status === 'Encerrada' && data.totalVotos > 0) {
        setMostrarTopTier(true);
        setTimeout(() => {
          celebrarVencedor();
        }, 2000);
      } else {
        setMostrarTopTier(false);
        setMostrandoVencedor(false);
      }
    } catch (error) {
      toast.error('Erro ao carregar resultados');
      console.error(error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const celebrarVencedor = () => {
    setMostrandoVencedor(true);
    
    // Confetti explosão
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    
    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50;
      
      confetti({
        particleCount,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d946ef', '#c026d3', '#a21caf', '#86198f', '#701a75'],
      });

      confetti({
        particleCount: particleCount / 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#d946ef', '#c026d3', '#a21caf'],
      });

      confetti({
        particleCount: particleCount / 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#d946ef', '#c026d3', '#a21caf'],
      });
    }, 250);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-neutral-400">Carregando resultados...</div>
      </div>
    );
  }

  if (!resultado) {
    return null;
  }

  const vencedor = resultado.resultados.reduce((prev, current) =>
    current.totalVotos > prev.totalVotos ? current : prev
  );

  const isEncerrada = resultado.status === 'Encerrada';

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <AnimatePresence>
        {mostrarTopTier && isEncerrada && resultado.totalVotos > 0 && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMostrarTopTier(false)}
          >
            <motion.div
              className="relative w-full max-w-2xl mx-4"
              initial={{ scale: 0, rotateX: -20, rotateY: -20 }}
              animate={{ scale: 1, rotateX: 0, rotateY: 0 }}
              exit={{ scale: 0, rotateX: -20, rotateY: -20 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15, duration: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Efeito de luz ao redor */}
              <motion.div
                className="absolute -inset-8 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-50"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Card principal */}
              <motion.div
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fuchsia-950 via-neutral-900 to-neutral-950 p-8 border-2 border-fuchsia-500/30"
              >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(217,70,239,0.3),transparent_50%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.3),transparent_50%)]" />
                </div>

                {/* Efeito de linha animada */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                <div className="relative z-10">
                  {/* "TOP 1" Badge */}
                  <motion.div
                    className="flex justify-center mb-6"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 150 }}
                  >
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-pink-600 rounded-full blur-xl"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <div className="relative px-6 py-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 rounded-full text-white font-bold text-xl">
                        🏆 TOP 1 🏆
                      </div>
                    </div>
                  </motion.div>

                  {/* Trophy Icon */}
                  <motion.div
                    className="flex justify-center mb-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      animate={{
                        y: [-10, 10, -10],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Trophy className="h-24 w-24 text-fuchsia-400 drop-shadow-2xl" />
                    </motion.div>
                  </motion.div>

                  {/* Resultado */}
                  <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-neutral-400 text-lg mb-3">VENCEDOR DA ENQUETE</p>
                    
                    <motion.h2
                      className="text-5xl font-black mb-4 bg-gradient-to-r from-fuchsia-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4, type: 'spring' }}
                    >
                      {vencedor.texto}
                    </motion.h2>

                    <motion.div
                      className="flex items-center justify-center gap-4 mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="h-6 w-6 text-yellow-400" />
                        <span className="text-4xl font-bold text-fuchsia-400">
                          {vencedor.totalVotos}
                        </span>
                        <span className="text-lg text-neutral-400">votos</span>
                      </div>

                      <div className="w-px h-12 bg-neutral-700" />

                      <div className="text-4xl font-bold bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                        {vencedor.percentual}%
                      </div>
                    </motion.div>

                    {/* Barra de progresso visual */}
                    <motion.div
                      className="relative h-2 bg-neutral-800 rounded-full overflow-hidden mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${vencedor.percentual}%` }}
                        transition={{ delay: 0.7, duration: 1.2, ease: 'easeOut' }}
                      />
                    </motion.div>
                  </motion.div>

                  {/* Botão para fechar */}
                  <motion.button
                    onClick={() => setMostrarTopTier(false)}
                    className="w-full py-3 px-6 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 rounded-xl font-bold text-white transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    Ver Resultados Completos
                  </motion.button>
                </div>

                {/* Sparkles */}
                <motion.div
                  className="absolute top-4 right-8 text-fuchsia-400"
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="h-6 w-6" />
                </motion.div>
                <motion.div
                  className="absolute bottom-8 left-8 text-purple-400"
                  animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <Sparkles className="h-5 w-5" />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mx-auto max-w-3xl px-6 py-12">
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

        {/* Título */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-2 flex items-center justify-center gap-2">
            <TrendingUp className="h-6 w-6 text-fuchsia-500" />
            <span className="text-sm font-semibold text-fuchsia-500">
              RESULTADOS
            </span>
          </div>
          <h1 className="mb-4 text-3xl font-bold">{resultado.pergunta}</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-neutral-400">
            <span>Status: {resultado.status}</span>
            <span>•</span>
            <span>{resultado.totalVotos} votos totais</span>
          </div>
        </motion.div>

        {/* Banner do Vencedor - Apenas quando encerrada */}
        {isEncerrada && resultado.totalVotos > 0 && (
          <motion.div
            className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-r from-fuchsia-600 via-fuchsia-500 to-pink-500 p-8"
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
          >
            {/* Sparkles animados */}
            <motion.div
              className="absolute inset-0 opacity-20"
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '50px 50px',
              }}
            />

            <div className="relative z-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className="mb-4 flex justify-center"
              >
                <Trophy className="h-16 w-16 text-white drop-shadow-lg" />
              </motion.div>
              
              <motion.h2
                className="mb-2 text-3xl font-bold text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                🎉 VENCEDOR! 🎉
              </motion.h2>
              
              <motion.p
                className="text-2xl font-semibold text-white mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {vencedor.texto}
              </motion.p>
              
              <motion.p
                className="text-lg text-white/90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {vencedor.totalVotos} votos ({vencedor.percentual}%)
              </motion.p>
            </div>

            {/* Efeito de brilho */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
          </motion.div>
        )}

        {/* Resultados */}
        <div className="space-y-4">
          {resultado.resultados.map((opcao, index) => {
            const isVencedor = opcao.texto === vencedor.texto && opcao.totalVotos > 0;
            
            return (
              <motion.div
                key={index}
                className={`rounded-2xl border-2 bg-neutral-900 p-6 transition-all ${
                  isVencedor && isEncerrada
                    ? 'border-fuchsia-500 shadow-lg shadow-fuchsia-500/20'
                    : 'border-neutral-800'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index + (isEncerrada && resultado.totalVotos > 0 ? 1 : 0) }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Cabeçalho da Opção */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-fuchsia-600 text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="text-lg font-semibold">{opcao.texto}</span>
                    {isVencedor && isEncerrada && (
                      <motion.span
                        className="rounded-full bg-fuchsia-600 px-3 py-1 text-xs font-bold flex items-center gap-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.9, type: "spring" }}
                      >
                        <Sparkles className="h-3 w-3" />
                        VENCEDOR
                      </motion.span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-fuchsia-500">
                      {opcao.percentual}%
                    </div>
                    <div className="text-sm text-neutral-400">
                      {opcao.totalVotos} votos
                    </div>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-800">
                  <motion.div
                    className={`h-full ${
                      isVencedor && isEncerrada
                        ? 'bg-gradient-to-r from-fuchsia-600 to-fuchsia-400'
                        : 'bg-neutral-600'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${opcao.percentual}%` }}
                    transition={{ delay: 0.2 * index + (isEncerrada && resultado.totalVotos > 0 ? 1.2 : 0.3), duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Estatísticas Resumidas */}
        {resultado.totalVotos === 0 && (
          <motion.div
            className="mt-8 rounded-xl bg-neutral-900 p-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-neutral-400">
              Ainda não há votos nesta enquete
            </p>
          </motion.div>
        )}

        {/* Botão para Voltar */}
        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={() => navigate('/')}
            className="bg-fuchsia-600 hover:bg-fuchsia-700"
          >
            Ver Todas as Enquetes
          </Button>
        </motion.div>
      </div>
    </div>
  );
}