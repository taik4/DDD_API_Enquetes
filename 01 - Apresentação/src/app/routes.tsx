import { createBrowserRouter } from 'react-router';
import { ListaEnquetes } from './components/ListaEnquetes';
import { CriarEnquete } from './components/CriarEnquete';
import { EditarEnquete } from './components/EditarEnquete';
import { VotarEnquete } from './components/VotarEnquete';
import { ResultadosEnquete } from './components/ResultadosEnquete';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ListaEnquetes />,
  },
  {
    path: '/criar',
    element: <CriarEnquete />,
  },
  {
    path: '/editar/:id',
    element: <EditarEnquete />,
  },
  {
    path: '/votar/:id',
    element: <VotarEnquete />,
  },
  {
    path: '/resultados/:id',
    element: <ResultadosEnquete />,
  },
]);