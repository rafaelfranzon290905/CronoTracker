import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from "./pages/Dashboard.tsx"
import Clientes from "./pages/Clientes.tsx"
import Projetos from "./pages/Projetos.tsx"
import TimeSheetPlanilha from './pages/Timesheets/TimeSheetPlanilha.tsx'
import Collaborators from "./pages/Collaborators.tsx"
import Atividades from './pages/Activities.tsx'
import UsersPage from './pages/User.tsx'
import Login from './pages/Login.tsx'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster richColors position="top-right"/>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/Dashboard' element={<Dashboard/>}/>
        <Route path="/TimeSheet" element={<TimeSheetPlanilha/>}/>
        <Route path='/Collaborators' element={<Collaborators/>}/>
        <Route path='/clientes' element={<Clientes/>}/>
        <Route path='/projetos' element={<Projetos/>}/>
        <Route path='/atividades' element={<Atividades/>}/>
        <Route path='/usuarios' element={<UsersPage/>}/>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
