import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Search, Calendar, Sun, Bell, Settings, User } from "lucide-react"

export default function Header() {
    return (
        <header className="flex justify-between p-2">
            <div className="flex items-center">
                <div className="relative">
                    <Input type="text" placeholder="Buscar" className="pl-2 pr-4 py-2 w-64 rounded-2xl"/>
                    <Search className="text-white absolute h-8 w-8 right-1 top-0.5 bg-blue-950 p-1 rounded-2xl"/>
                </div>
                <hr className="border border-gray-400 h-9 mx-2" />
                <Calendar className="text-white h-9 w-9 bg-blue-950 rounded-3xl p-1.5"/>
                <Button className="bg-blue-950 rounded-2xl text-white hover:bg-blue-700 mx-3">+ Criar</Button>

            </div>

            <div className="flex mx-3 items-center">

                <Sun className="text-gray-400 h-9 w-9 bg-gray-200 p-1.5 rounded-3xl mx-1"/>
                <Bell className="text-gray-400 h-9 w-9 bg-gray-200 p-1.5 rounded-3xl mx-1"/>
                <Settings className="text-gray-400 h-9 w-9 bg-gray-200 p-1.5 rounded-3xl mx-1"/>
                <hr className="border border-gray-400 h-9 mx-3" />
                <h3 className="p-1">Fulano Borges de Oliveira</h3>
                <User className="text-black h-12 w-12 bg-gray-200 p-2 rounded-3xl mx-3"/>
            </div>


        </header>
    )
}