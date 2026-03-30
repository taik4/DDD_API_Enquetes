import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, X, Calendar, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { enqueteService } from '../services/enquete-service';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function CriarEnquete() {
  const navigate = useNavigate();
  const [pergunta, setPergunta] = useState('');
  const [opcoes, setOpcoes] = useState<string[]>(['', '']);
  
  // Separar data e hora
  const [dataInicio, setDataInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [dataFim, setDataFim] = useState('');
  const [horaFim, setHoraFim] = useState('18:00');
  
  const [loading, setLoading] = useState(false);

  const handleAdicionarOpcao = () => {
    setOpcoes([...opcoes, '']);
  };

  const handleRemoverOpcao = (index: number) => {
    if (opcoes.length <= 2) {
      toast.error('É necessário ter pelo menos 2 opções');
      return;
    }
    setOpcoes(opcoes.filter((_, i) => i !== index));
  };

  const handleOpcaoChange = (index: number, valor: string) => {
    const novasOpcoes = [...opcoes];
    novasOpcoes[index] = valor;
    setOpcoes(novasOpcoes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pergunta.trim()) {
      toast.error('Por favor, insira uma pergunta');
      return;
    }

    const opcoesPreenchidas = opcoes.filter((o) => o.trim() !== '');
    if (opcoesPreenchidas.length < 2) {
      toast.error('É necessário ter pelo menos 2 opções preenchidas');
      return;
    }

    if (!dataInicio || !horaInicio || !dataFim || !horaFim) {
      toast.error('Por favor, defina os prazos de início e fim');
      return;
    }

    // Combinar data e hora
    const prazoInicio = `${dataInicio}T${horaInicio}`;
    const prazoFim = `${dataFim}T${horaFim}`;

    try {
      setLoading(true);
      await enqueteService.criar({
        pergunta: pergunta.trim(),
        prazoInicio,
        prazoFim,
        opcoes: opcoesPreenchidas,
      });
      toast.success('Enquete criada com sucesso!');
      navigate('/');
    } catch (error) {
      toast.error('Erro ao criar enquete');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Header */}
        <motion.button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-fuchsia-500 hover:text-fuchsia-400"
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-semibold">Voltar</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mb-2 text-4xl font-bold text-fuchsia-500">
            Criar Enquete
          </h1>
          <p className="mb-8 text-neutral-400">
            Crie uma nova enquete para compartilhar com sua audiência
          </p>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              className="rounded-2xl bg-neutral-900 p-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              {/* Título da Enquete */}
              <div className="mb-6">
                <label className="mb-2 block font-semibold">
                  Título da Enquete
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Qual é o melhor app?"
                  value={pergunta}
                  onChange={(e) => setPergunta(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                />
              </div>

              {/* Prazos - Melhorados */}
              <div className="mb-6 space-y-4">
                <h3 className="font-semibold text-fuchsia-400 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Período da Enquete
                </h3>
                
                {/* Início */}
                <div className="rounded-xl bg-neutral-800 p-4">
                  <label className="mb-3 block text-sm font-medium text-neutral-300">
                    Início da Votação
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-neutral-400">Data</label>
                      <Input
                        type="date"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        className="bg-neutral-700 border-neutral-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-neutral-400">Horário</label>
                      <Input
                        type="time"
                        value={horaInicio}
                        onChange={(e) => setHoraInicio(e.target.value)}
                        className="bg-neutral-700 border-neutral-600 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Fim */}
                <div className="rounded-xl bg-neutral-800 p-4">
                  <label className="mb-3 block text-sm font-medium text-neutral-300">
                    Encerramento da Votação
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-neutral-400">Data</label>
                      <Input
                        type="date"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        className="bg-neutral-700 border-neutral-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-neutral-400">Horário</label>
                      <Input
                        type="time"
                        value={horaFim}
                        onChange={(e) => setHoraFim(e.target.value)}
                        className="bg-neutral-700 border-neutral-600 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Opções */}
              <div className="mb-6">
                <label className="mb-4 block font-semibold">Opções</label>
                <div className="space-y-3">
                  {opcoes.map((opcao, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-fuchsia-600 text-sm font-bold">
                        {index + 1}
                      </span>
                      <Input
                        type="text"
                        placeholder={`Opção ${index + 1}`}
                        value={opcao}
                        onChange={(e) => handleOpcaoChange(index, e.target.value)}
                        className="flex-1 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                      />
                      {opcoes.length > 2 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoverOpcao(index)}
                          className="text-red-500 hover:bg-red-950 hover:text-red-400"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  type="button"
                  onClick={handleAdicionarOpcao}
                  className="mt-4 flex items-center gap-2 text-fuchsia-500 hover:text-fuchsia-400"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-semibold">Adicionar Opção</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Botões */}
            <motion.div
              className="flex justify-end gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/')}
                className="bg-neutral-700 hover:bg-neutral-600"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-fuchsia-600 hover:bg-fuchsia-700"
              >
                {loading ? 'Criando...' : 'Criar Enquete'}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}