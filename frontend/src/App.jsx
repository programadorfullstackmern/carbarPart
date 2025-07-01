import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { AutoProvider } from './context/AutoProvider'
import { PiezaProvider } from './context/PiezaProvider'

function App() {
  return (
    <AutoProvider>
      <PiezaProvider>
        <RouterProvider router={router} />
      </PiezaProvider>
    </AutoProvider>
  )
}

export default App