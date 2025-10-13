import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Search, Calendar, Sun, Bell, Settings, User, Menu, X, Clock, Home, Users, Rocket, Activity, DollarSign, FileText } from "lucide-react"
import CronosBranco from "../../imagens/ChronosAzulFundoRemovido.png"


export default function Header() {
    const [menuAberto, setMenuAberto] = useState(false);


    return (
        <>
        {/* Responsividade: Header para telas menores */}
        <header className="md:hidden bg-blue-950 p-2 fixed top-0 left-0 w-full h-14">
        <div className="flex justify-between items-center mx-2">
            <button onClick={() => setMenuAberto(!menuAberto)} className="p-1 rounded-md duration-200 active:scale-80">
                {menuAberto ? <X className="h-10 w-10 text-white"/> : <Menu className="h-10 w-10 text-white"/>}
            </button>
            <img src={CronosBranco} className="h-10 w-10 !bg-transparent mix-blend-normal"></img>
            <User className="text-black h-10 w-10 bg-gray-300 p-1 rounded-3xl"/>
        </div>
                <div className={`text-white bg-blue-950 flex flex-col fixed top-14 left-0 h-screen p-2 transition-all duration-300 -translate-x-full ${menuAberto ? "w-75 translate-x-0" : ""}`}>
                    <Link to="/">
                    <Button variant="ghost" className="bg-blue-950 text-white hover:bg-blue-900 h-10 px-3 my-2 flex items-center gap-2 text-2xl">
                        <Home className="!w-6 !h-6" />
                        Dashboard
                    </Button></Link>
                    
                    
                    <Link to="/TimeSheet">
                    <Button variant="ghost" className="bg-blue-950 text-white hover:bg-blue-900 h-10 px-3 my-2 flex items-center gap-2 text-2xl">
                        <Clock className="!w-6 !h-6" />
                        TimeSheets
                    </Button></Link>
                    
                    <Link to="/Clientes">
                    <Button variant="ghost" className="bg-blue-950 text-white hover:bg-blue-900 h-10 px-3 my-2 flex items-center gap-2 text-2xl">
                        <Users className="!w-6 !h-6" />
                        Clientes
                    </Button></Link>

                    <Link to="/Collaborators">
                    <Button variant="ghost" className="bg-blue-950 text-white hover:bg-blue-900 h-10 px-3 my-2 flex items-center gap-2 text-2xl">
                        <User className="!w-6 !h-6" /> Colaboradores
                    </Button></Link>

                    <Link to="/Projetos">
                    <Button variant="ghost" className="bg-blue-950 text-white hover:bg-blue-900 h-10 px-3 my-2 flex items-center gap-2 text-2xl">
                        <Rocket className="!w-6 !h-6" /> Projetos
                    </Button></Link>

                    <Button variant="ghost" className="bg-blue-950 text-white hover:bg-blue-900 h-10 px-3 my-2 flex items-center gap-2 text-2xl">
                        <Activity className="!w-6 !h-6" /> Atividades
                    </Button>

                    <Button variant="ghost" className="bg-blue-950 text-white hover:bg-blue-900 h-10 px-3 my-2 flex items-center gap-2 text-2xl">
                        <FileText className="!w-6 !h-6" /> Relatórios
                    </Button>

                    <Button variant="ghost" className="bg-blue-950 text-white hover:bg-blue-900 h-10 px-3 my-2 flex items-center gap-2 text-2xl">
                        <DollarSign className="!w-6 !h-6" /> Despesas
                    </Button>
                </div>
        </header>
        <div className="h-10 md:hidden"></div>

        {/* Header padrão para telas maiores */}
        <header className="flex justify-between p-0 hidden md:flex">
            <div className="flex items-center">
                <div className="relative">
                    <Input type="text" placeholder="Buscar" className="pl-2 pr-4 py-2 w-64 rounded-2xl" />
                    <Search className="text-white absolute h-8 w-8 right-1 top-0.5 bg-blue-950 p-1 rounded-2xl" />
                </div>
                <hr className="border border-gray-400 h-9 mx-2" />
                <Calendar className="text-white h-9 w-9 bg-blue-950 rounded-3xl p-2" />
                <Button className="bg-blue-950 rounded-2xl text-white hover:bg-blue-700 mx-3">+ Criar</Button>

            </div>

            <div className="flex mx-3 items-center">

                <Sun className="text-gray-400 h-9 w-9 bg-gray-200 p-2 rounded-3xl mx-1" />
                <Bell className="text-gray-400 h-9 w-9 bg-gray-200 p-2 rounded-3xl mx-1" />
                <Settings className="text-gray-400 h-9 w-9 bg-gray-200 p-2 rounded-3xl mx-1" />
                <hr className="border border-gray-400 h-9 mx-3" />
                <h3 className="p-1">Rafaela Borges de Oliveira</h3>
                <User className="text-black h-9 w-9 bg-gray-200 p-1 rounded-3xl mx-3" />
            </div>


        </header>
        </>
    )
}