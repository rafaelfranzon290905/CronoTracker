import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from "./pages/Dashboard.tsx"
import Clientes from "./pages/Clientes.tsx"
import Projetos from "./pages/Projetos.tsx"
import TimeSheetPlanilha from './pages/TimeSheetPlanilha.tsx'
import Collaborators from "./pages/Collaborators.tsx"
import Atividades from './pages/Activities.tsx'
import UsersPage from './pages/User.tsx'
import Login from './pages/Login.tsx'
import { Toaster } from 'sonner'
import LancamentoPage from './components/Timesheets/lancamentoForm.tsx'
import DetalhesProjeto from './pages/DetalhesProjeto.tsx'
import GestaoDespesas from './pages/GestaoDespesas.tsx'
import DetalhesAtividade from "./pages/DetalhesAtividade";

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
        <Route path='/projetos/:id' element={<DetalhesProjeto/>}/>
        <Route path='/atividades' element={<Atividades/>}/>
        <Route path="/atividades/:id" element={<DetalhesAtividade />} />
        <Route path='/usuarios' element={<UsersPage/>}/>
        <Route path="/TimeSheet/Lancamentos" element={<LancamentoPage/>}/>
        <Route path="/gestao-despesas" element={<GestaoDespesas />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
