import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Home, Users, FileText, DollarSign, Clock, Rocket, Activity, LogOut } from "lucide-react"
import ChronosAzulFundoRemovido from "../../imagens/ChronosAzulFundoRemovido.png"

export default function SideBar() {
    return (
        <>
        {/* Sidebar */}
      <aside className="w-64 bg-sidebar shadow-2xl flex flex-col rounded-4xl m-4 hidden md:block" aria-label="Sidebar">
        <div className="p-6 flex items-center space-x-2 font-bold text-lg">
          <img src={ChronosAzulFundoRemovido} alt="Logo do ChronoTracker" className="h-12 w-12" />
          <span>CHRONO TRACKER</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 text-sm">
          <Link to="/"><Button className="w-full justify-start bg-botao-dark " aria-label="Botão para acessar Dashboard"><Home className="mr-2 scale-120" /> Dashboard</Button></Link>
          <Link to="/TimeSheet"><Button variant="ghost" className="w-full justify-start" aria-label="Botão para acessar TimeSheets"><Clock className="mr-2 scale-120" /> TimeSheet</Button></Link>
          <Link to="/clientes"><Button variant="ghost" className="w-full justify-start" aria-label="Botão para acessar Clientes"><Users className="mr-2 scale-120" /> Clientes</Button></Link>
          <Link to="/collaborators"><Button variant="ghost" className="w-full justify-start" aria-label="Botão para acessar Colaboradores"><Users className="mr-2 scale-120" /> Colaboradores</Button></Link>
          <Link to="/projetos"><Button variant="ghost" className="w-full justify-start" aria-label="Botão para acessar Projetos"><Rocket className="mr-2 scale-120" /> Projetos</Button></Link>
          <Button variant="ghost" className="w-full justify-start" aria-label="Botão para acessar Atividades"><Activity className="mr-2 scale-120" /> Atividades</Button>
          <Button variant="ghost" className="w-full justify-start" aria-label="Botão para acessar Relatórios"><FileText className="mr-2 scale-120" /> Relatórios</Button>
          <Button variant="ghost" className="w-full justify-start" aria-label="Botão para acessar Despesas"><DollarSign className="mr-2 scale-120" /> Despesas</Button>
        </nav>
        <div className="p-4">
          <Button className="w-full bg-botao-dark" aria-label="Botão para sair do site"><LogOut className="mr-2 h-4 w-4 scale-120"/>Log Out</Button>
        </div>
      </aside>
        </>
    );
}