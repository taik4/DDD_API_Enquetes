import { useState } from 'react';
import { Settings, Database, Cloud } from 'lucide-react';
import { Button } from './ui/button';

export function ConfigPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [apiUrl, setApiUrl] = useState('https://localhost:7025/api/enquetes');
  const [useMock, setUseMock] = useState(true);

  const handleSaveConfig = () => {
    // Salvar no localStorage
    localStorage.setItem('apiUrl', apiUrl);
    localStorage.setItem('useMockData', useMock.toString());
    
    // Recarregar a página para aplicar mudanças
    window.location.reload();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-fuchsia-600 shadow-lg hover:bg-fuchsia-700 transition-colors"
        title="Configurações da API"
      >
        <Settings className="h-6 w-6 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 rounded-2xl bg-neutral-900 p-6 shadow-2xl border border-neutral-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Configurações da API</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-neutral-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Modo de Dados */}
      <div className="mb-6">
        <label className="mb-3 block text-sm font-semibold text-white">
          Fonte de Dados
        </label>
        <div className="space-y-2">
          <button
            onClick={() => setUseMock(true)}
            className={`w-full flex items-center gap-3 rounded-lg p-4 transition-all ${
              useMock
                ? 'bg-fuchsia-600 border-2 border-fuchsia-500'
                : 'bg-neutral-800 border-2 border-neutral-700 hover:border-neutral-600'
            }`}
          >
            <Database className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold text-white">Dados Mock</div>
              <div className="text-xs text-neutral-300">
                Dados de exemplo locais
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setUseMock(false)}
            className={`w-full flex items-center gap-3 rounded-lg p-4 transition-all ${
              !useMock
                ? 'bg-fuchsia-600 border-2 border-fuchsia-500'
                : 'bg-neutral-800 border-2 border-neutral-700 hover:border-neutral-600'
            }`}
          >
            <Cloud className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold text-white">API Real</div>
              <div className="text-xs text-neutral-300">
                Conectar à sua API ASP.NET
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* URL da API */}
      {!useMock && (
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-white">
            URL da API
          </label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="https://localhost:7025/api/enquetes"
            className="w-full rounded-lg bg-neutral-800 border-2 border-neutral-700 px-4 py-2 text-white placeholder:text-neutral-500 focus:border-fuchsia-500 focus:outline-none"
          />
          <p className="mt-2 text-xs text-neutral-400">
            Configure CORS na sua API para permitir acesso do navegador
          </p>
        </div>
      )}

      {/* Informações sobre CORS */}
      {!useMock && (
        <div className="mb-6 rounded-lg bg-orange-950 border border-orange-900 p-4">
          <p className="text-sm text-orange-200 mb-2 font-semibold">
            ⚠️ Configuração Necessária
          </p>
          <p className="text-xs text-orange-300">
            Para conectar à API, adicione CORS no seu Startup.cs ou Program.cs:
          </p>
          <pre className="mt-2 text-xs bg-neutral-950 p-2 rounded overflow-x-auto text-orange-100">
{`builder.Services.AddCors(options =>
{
  options.AddPolicy("Allow", builder =>
  {
    builder.AllowAnyOrigin()
           .AllowAnyMethod()
           .AllowAnyHeader();
  });
});`}
          </pre>
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-3">
        <Button
          onClick={() => setIsOpen(false)}
          variant="secondary"
          className="flex-1 bg-neutral-700 hover:bg-neutral-600"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSaveConfig}
          className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-700"
        >
          Aplicar
        </Button>
      </div>
    </div>
  );
}
