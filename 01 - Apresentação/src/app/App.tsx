import { BrowserRouter, Routes, Route } from 'react-router';
import { Toaster } from './components/ui/sonner';
import { ConfigPanel } from './components/ConfigPanel';
import { ListaEnquetes } from './components/ListaEnquetes';
import { CriarEnquete } from './components/CriarEnquete';
import { EditarEnquete } from './components/EditarEnquete';
import { VotarEnquete } from './components/VotarEnquete';
import { ResultadosEnquete } from './components/ResultadosEnquete';

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ListaEnquetes />} />
          <Route path="/criar" element={<CriarEnquete />} />
          <Route path="/editar/:id" element={<EditarEnquete />} />
          <Route path="/votar/:id" element={<VotarEnquete />} />
          <Route path="/resultados/:id" element={<ResultadosEnquete />} />
        </Routes>
      </BrowserRouter>
      <ConfigPanel />
      <Toaster position="top-right" />
    </>
  );
}