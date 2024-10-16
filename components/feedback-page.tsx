"use client"

import React, { useState } from 'react'
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
  PieChart,
  ArrowLeft
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
import { getDatabase, ref, onValue, off } from "firebase/database";
import { initializeApp } from "firebase/app";
import { DataSnapshot } from 'firebase/database';
import Link from "next/link"

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

// Firebase configuration
const firebaseConfig = {
  // Add your Firebase configuration here
  databaseURL: "https://expi-e7219-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

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
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar')
  const [isChartVisible, setIsChartVisible] = useState(true)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right')

  // Function to handle chart type change with animation
  const handleChartTypeChange = (newType: 'bar' | 'line' | 'pie') => {
    const currentTypeIndex = ['bar', 'line', 'pie'].indexOf(chartType)
    const newTypeIndex = ['bar', 'line', 'pie'].indexOf(newType)
    const newDirection = newTypeIndex > currentTypeIndex ? 'left' : 'right'
    
    setSlideDirection(newDirection)
    setIsChartVisible(false)
    setTimeout(() => {
      setChartType(newType)
      setIsChartVisible(true)
    }, 300) // This should match the transition duration in CSS
  }

  // Função para formatar data e hora
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

  // Realtime data fetching
  React.useEffect(() => {
    const feedbackRef = ref(database, 'feedback');
    
    const handleData = (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const feedbackArray: Feedback[] = Object.keys(data).map(key => ({
          id: key,
          usuario: data[key].usuario,
          rating: data[key].rating,
          data: data[key].data,
          comentario: data[key].comentario || '-'
        }));
        setFeedbackData(feedbackArray);
      }
    };

    onValue(feedbackRef, handleData);

    // Cleanup function
    return () => {
      off(feedbackRef, 'value', handleData);
    };
  }, []);

  React.useEffect(() => {
    setCurrentPage(1) // Reset para a primeira página quando itemsPerPage mudar
  }, [itemsPerPage])

  // Ordenação dos dados
  const sortedData = React.useMemo(() => {
    return [...feedbackData].sort((a, b) => {
      const aValue = a[sortColumn] ?? '';
      const bValue = b[sortColumn] ?? '';
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    })
  }, [feedbackData, sortColumn, sortDirection])

  // Paginação
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedData.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedData, currentPage, itemsPerPage])

  const totalPages = React.useMemo(() => {
    return Math.ceil(sortedData.length / itemsPerPage)
  }, [sortedData, itemsPerPage])

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
          weight: 'bold' as const,
        },
      },
    },
  } as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Add the "Back to Home" button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Dashboard de Feedback</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Feedbacks</CardTitle>
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
                onClick={() => handleChartTypeChange('bar')}
              >
                <BarChart className="h-4 w-4" />
                <span className="sr-only">Gráfico de Barras</span>
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="icon"
                onClick={() => handleChartTypeChange('line')}
              >
                <LineChart className="h-4 w-4" />
                <span className="sr-only">Gráfico de Linha</span>
              </Button>
              <Button
                variant={chartType === 'pie' ? 'default' : 'outline'}
                size="icon"
                onClick={() => handleChartTypeChange('pie')}
              >
                <PieChart className="h-4 w-4" />
                <span className="sr-only">Gráfico de Pizza</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center items-center overflow-hidden">
            <div 
              className={`w-full max-w-2xl h-[300px] ${chartType === 'pie' ? 'flex justify-center items-center' : ''} 
                transition-all duration-300 ease-in-out 
                ${isChartVisible 
                  ? 'opacity-100 transform translate-x-0' 
                  : `opacity-0 transform ${slideDirection === 'left' ? '-translate-x-full' : 'translate-x-full'}`
                }`}
            >
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
                        <TableRow className="cursor-pointer hover:bg-gray-100">
                          <TableCell className="font-medium">{feedback.id}</TableCell>
                          <TableCell>{feedback.usuario}</TableCell>
                          <TableCell>
                            {feedback.comentario
                              ? `${feedback.comentario.substring(0, 50)}...`
                              : 'Sem comentário'}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRatingColor(feedback.rating)}`}>
                              {feedback.rating}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">{formatDate(feedback.data)}</TableCell>
                        </TableRow>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
                        <DialogHeader>
                          <DialogTitle>Detalhes do Feedback</DialogTitle>
                        </DialogHeader>
                        <div className="flex-grow overflow-y-auto pr-6">
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
                                <p className="whitespace-pre-wrap break-words">{feedback.comentario || '-'}</p>
                              </div>
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