'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    window.location.href = "https://" + searchQuery
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">

      <main className="bg-slate-950 flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-100">404</h1>
          <h2 className="mt-2 text-3xl font-bold text-gray-100">Loja não encontrada</h2>
          <p className="mt-2 text-sm text-gray-100">
            A loja que você procura não existe ou foi movida.
          </p>

          <div className="flex rounded-md shadow-sm mt-5">
            <Input
              type="text"
              required
              className="flex-grow bg-slate-900 border-slate-900"
              placeholder="Procure por uma loja"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button onClick={handleSearch} type="submit" className="ml-3 bg-slate-900 hover:bg-slate-800">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-5">
            <Link href="https://Wizesale" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Ir para site principal
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-slate-950">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center">
            <div className="px-5 py-2">
              <Link href="Wizesale/about" className="text-sm text-gray-400 hover:text-gray-900">
                Sobre a Wizesale
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link href="https://Wizesale/sac" className="text-sm text-gray-400 hover:text-gray-500">
                Nosso Suporte
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link href="https://Wizesale/sac" className="text-sm text-gray-400 hover:text-gray-500">
                Contate-nos
              </Link>
            </div>
          </nav>
          <p className="mt-4 text-center text-sm text-gray-400">
            &copy; 2024-Presente Wizesale, Todos os Direitos Reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

