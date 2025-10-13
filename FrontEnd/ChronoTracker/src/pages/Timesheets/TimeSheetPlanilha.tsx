import { useState } from "react"
import { Button } from "@/components/ui/button"
import Header from "@/components/componentes/Header"
import SideBar from "@/components/componentes/SideBar"

export default function TimeSheetPlanilha(){
    return(
        <>
            <div className="flex h-screen bg-gray-50">
      
                <SideBar/>


        {/* Conteúdo */}
        <main className="flex-1 p-6 overflow-auto">
            {/* Header com Searchbar */}
            <Header/>
            <h1 className="bg-yellow-500">Início da página TimeSheets</h1>
            </main>
            </div>
        </>
    )
}