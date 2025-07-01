import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import AutoList from './pages/Autos/AutoList'
import AutoForm from './pages/Autos/AutoForm'
import AutoDetail from './pages/Autos/AutoDetail'
import PiezaList from './pages/Piezas/PiezaList'
import PiezaForm from './pages/Piezas/PiezaForm'
import PiezaDetail from './pages/Piezas/PiezaDetail'
import SearchAutos from './pages/Search/SearchAutos'
import SearchPiezas from './pages/Search/SearchPiezas'
import ErrorPage from './pages/ErrorPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'autos',
        children: [
          {
            index: true,
            element: <AutoList />
          },
          {
            path: 'nuevo',
            element: <AutoForm />
          },
          {
            path: 'editar/:id',
            element: <AutoForm />
          },
          {
            path: ':id',
            element: <AutoDetail />
          }
        ]
      },
      {
        path: 'piezas',
        children: [
          {
            index: true,
            element: <PiezaList />
          },
          {
            path: 'nueva',
            element: <PiezaForm />
          },
          {
            path: 'editar/:id',
            element: <PiezaForm />
          },
          {
            path: ':id',
            element: <PiezaDetail />
          }
        ]
      },
      {
        path: 'buscar',
        children: [
          {
            path: 'autos',
            element: <SearchAutos />
          },
          {
            path: 'piezas',
            element: <SearchPiezas />
          }
        ]
      }
    ]
  }
])