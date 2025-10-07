import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from "./pages/Dashboard.tsx"
import Clientes from "./pages/Clientes.tsx"
import Projetos from "./pages/Projetos.tsx"
import TimeSheetPlanilha from './pages/Timesheets/TimeSheetPlanilha.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Dashboard/>}/>
        <Route path="/TimeSheet" element={<TimeSheetPlanilha/>}/>
        <Route path='/clientes' element={<Clientes/>}/>
        <Route path='/projetos' element={<Projetos/>}/>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
