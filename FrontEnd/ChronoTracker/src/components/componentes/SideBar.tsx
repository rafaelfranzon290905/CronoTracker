import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Home, Users, FileText, DollarSign, Clock, Rocket, Activity } from "lucide-react"
import CronosAzul from "../../imagens/ChronosAzul.png"

export default function SideBar() {
    return (
        <>
        {/* Sidebar */}
      <aside className="w-64 bg-blue-50 shadow-2xl flex flex-col rounded-4xl m-4">
        <div className="p-6 flex items-center space-x-2 font-bold text-lg">
          <img src={CronosAzul} className="h-12 w-12" />
          <span>CHRONO TRACKER</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 text-sm">
          <Button variant="ghost" className="w-full justify-start bg-blue-900 text-white"><Home className="mr-2 h-4 w-4" /> Dashboard</Button>
          <Link to="/TimeSheet"><Button variant="ghost" className="w-full justify-start"><Clock className="mr-2 h-4 w-4" /> TimeSheet</Button></Link>
          <Link to="/clientes"><Button variant="ghost" className="w-full justify-start"><Users className="mr-2 h-4 w-4" /> Clientes</Button></Link>
          <Link to="/projetos"><Button variant="ghost" className="w-full justify-start"><Rocket className="mr-2 h-4 w-4" /> Projetos</Button></Link>
          <Button variant="ghost" className="w-full justify-start"><Activity className="mr-2 h-4 w-4" /> Atividades</Button>
          <Button variant="ghost" className="w-full justify-start"><FileText className="mr-2 h-4 w-4" /> Relatórios</Button>
          <Button variant="ghost" className="w-full justify-start"><DollarSign className="mr-2 h-4 w-4" /> Despesas</Button>
        </nav>
        <div className="p-4">
          <Button variant="destructive" className="w-full">Log Out</Button>
        </div>
      </aside>
        </>
    );
}