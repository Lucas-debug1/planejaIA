import { RouterProvider } from 'react-router-dom'

import { ThemeProvider } from './context/theme/ThemeProvider'
import { router } from './router'

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App
