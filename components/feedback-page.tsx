"use client"

import React from 'react'
import { 
  Table, 
  TableBody,  
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  BarChart,
  LineChart,
  PieChart
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, Line, Pie } from 'react-chartjs-2'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend
)

// URL correta da API do Firebase
const firebaseURL = "https://expi-e7219-default-rtdb.firebaseio.com/feedback.json"

type Feedback = {
  id: string
  usuario: string
  rating: 'Neutro' | 'Bom' | 'Ruim' | 'Insatisfeito'
  data: string
  comentario?: string
}

export function FeedbackPageComponent() {
  const [feedbackData, setFeedbackData] = React.useState<Feedback[]>([])
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)
  const [sortColumn, setSortColumn] = React.useState<keyof Feedback>('data')
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc')
  const [chartType, setChartType] = React.useState<'bar' | 'line' | 'pie'>('bar')
  const [selectedFeedback, setSelectedFeedback] = React.useState<Feedback | null>(null)

  // Add this function at the top of your component, after the useState declarations
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para consumir a API REST do Firebase
  React.useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        const response = await fetch(firebaseURL) // Fazendo o fetch da API REST
        const data = await response.json()

        if (data) {
          const feedbackArray: Feedback[] = Object.keys(data).map(key => ({
            id: key,
            usuario: data[key].usuario, // Atualizamos para garantir que a chave corresponde ao JSON
            rating: data[key].rating,   // Atualizamos para garantir que a chave corresponde ao JSON
            data: data[key].data,       // Atualizamos para garantir que a chave corresponde ao JSON
            comentario: data[key].comentario || '-' // Comentário opcional
          }))
          setFeedbackData(feedbackArray)
        }
      } catch (error) {
        console.error('Erro ao buscar dados do Firebase:', error)
      }
    }

    fetchFeedbackData()
  }, [])

  // Ordenação dos dados
  const sortedData = React.useMemo(() => {
    return [...feedbackData].sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1
      if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [feedbackData, sortColumn, sortDirection])

  // Paginação dos dados
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(feedbackData.length / itemsPerPage)

  const handleSort = (column: keyof Feedback) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Função para atribuir a cor correta ao rating
  const getRatingColor = (rating: Feedback['rating']) => {
    switch (rating) {
      case 'Bom': return 'text-green-600 bg-green-100'
      case 'Neutro': return 'text-yellow-600 bg-yellow-100'
      case 'Ruim': return 'text-orange-600 bg-orange-100'
      case 'Insatisfeito': return 'text-red-600 bg-red-100'
      default: return ''
    }
  }

  // Dados do gráfico
  const chartData = {
    labels: ['Bom', 'Neutro', 'Ruim', 'Insatisfeito'],
    datasets: [
      {
        label: 'Número de Feedbacks',
        data: [
          feedbackData.filter(f => f.rating === 'Bom').length,
          feedbackData.filter(f => f.rating === 'Neutro').length,
          feedbackData.filter(f => f.rating === 'Ruim').length,
          feedbackData.filter(f => f.rating === 'Insatisfeito').length,
        ],
        backgroundColor: ['rgba(34, 197, 94, 0.6)', 'rgba(234, 179, 8, 0.6)', 'rgba(249, 115, 22, 0.6)', 'rgba(239, 68, 68, 0.6)'],
        borderColor: ['rgba(34, 197, 94, 1)', 'rgba(234, 179, 8, 1)', 'rgba(249, 115, 22, 1)', 'rgba(239, 68, 68, 1)'],
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        type: 'category' as const,
      },
      y: {
        type: 'linear' as const,
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Distribuição de Feedbacks',
        font: {
          size: 16,
          weight: 'bold'
        },
      },
    },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Dashboard de Feedback</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Feedbacks</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feedbackData.length}</div>
              <p className="text-xs text-muted-foreground">
                +20.1% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2</div>
              <p className="text-xs text-muted-foreground">
                +8% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Feedbacks Positivos</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {feedbackData.filter(f => f.rating === 'Bom').length}
              </div>
              <p className="text-xs text-muted-foreground">
                +12% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Gráfico de Feedbacks</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setChartType('bar')}
              >
                <BarChart className="h-4 w-4" />
                <span className="sr-only">Gráfico de Barras</span>
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setChartType('line')}
              >
                <LineChart className="h-4 w-4" />
                <span className="sr-only">Gráfico de Linha</span>
              </Button>
              <Button
                variant={chartType === 'pie' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setChartType('pie')}
              >
                <PieChart className="h-4 w-4" />
                <span className="sr-only">Gráfico de Pizza</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            <div className={`w-full max-w-2xl h-[300px] ${chartType === 'pie' ? 'flex justify-center items-center' : ''}`}>
              {chartType === 'bar' && <Bar data={chartData} options={chartOptions} />}
              {chartType === 'line' && <Line data={chartData} options={chartOptions} />}
              {chartType === 'pie' && (
                <div className="w-[300px] h-[300px]">
                  <Pie data={chartData} options={chartOptions} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedbacks Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Itens por página" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 por página</SelectItem>
                  <SelectItem value="10">10 por página</SelectItem>
                  <SelectItem value="20">20 por página</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    <Button variant="ghost" onClick={() => handleSort('id')}>
                      ID {sortColumn === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('usuario')}>
                      Usuário {sortColumn === 'usuario' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </Button>
                  </TableHead>
                  <TableHead>Comentário</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('rating')}>
                      Rating {sortColumn === 'rating' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => handleSort('data')}>
                      Data {sortColumn === 'data' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((feedback) => (
                  <Dialog key={feedback.id}>
                    <DialogTrigger asChild>
                      <TableRow className="cursor-pointer hover:bg-gray-100" onClick={() => setSelectedFeedback(feedback)}>
                        <TableCell className="font-medium">{feedback.id}</TableCell>
                        <TableCell>{feedback.usuario}</TableCell>
                        <TableCell>{feedback.comentario || '-'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRatingColor(feedback.rating)}`}>
                            {feedback.rating}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{formatDate(feedback.data)}</TableCell>
                      </TableRow>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Detalhes do Feedback</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="font-bold">ID:</span>
                          <span className="col-span-3">{feedback.id}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="font-bold">Usuário:</span>
                          <span className="col-span-3">{feedback.usuario}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="font-bold">Rating:</span>
                          <span className="col-span-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRatingColor(feedback.rating)}`}>
                              {feedback.rating}
                            </span>
                          </span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="font-bold">Data:</span>
                          <span className="col-span-3">{formatDate(feedback.data)}</span>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                          <span className="font-bold">Comentário:</span>
                          <div className="col-span-3">
                            {feedback.comentario && feedback.comentario.length > 100 ? (
                              <p className="whitespace-pre-wrap break-words">{feedback.comentario}</p>
                            ) : (
                              <span>{feedback.comentario || '-'}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}