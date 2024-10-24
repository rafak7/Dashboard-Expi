"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bar, Line, Doughnut } from 'react-chartjs-2'
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
import Link from 'next/link'
import { ArrowRight, Users, Star, MessageSquare, TrendingUp, Bell, Settings } from 'lucide-react'
import { Avatar, AvatarFallback} from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

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

interface FeedbackItem {
  id: number;
  content: string;
  createdAt: string;
  rating?: number;
  // Add other relevant fields
}

export function DashboardHomeComponent() {
  const [timeRange, setTimeRange] = React.useState('7d')
  const [feedbackDataFromApi, setFeedbackDataFromApi] = React.useState<FeedbackItem[]>([])
  const [uraDataFromApi, setUraDataFromApi] = React.useState<FeedbackItem[]>([]) // Novo estado para dados da API ura.json

  // Função para buscar dados da API feedback.json
  React.useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        const response = await fetch('https://expi-e7219-default-rtdb.firebaseio.com/feedback.json')
        const data = await response.json()
        if (data) {
          const feedbackArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }))
          setFeedbackDataFromApi(feedbackArray)
        }
      } catch (error) {
        console.error('Erro ao buscar dados da API:', error)
      }
    }

    // Função para buscar dados da API ura.json
    const fetchUraData = async () => {
      try {
        const response = await fetch('https://expi-e7219-default-rtdb.firebaseio.com/ura.json')
        const data = await response.json()
        if (data) {
          const uraArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }))
          setUraDataFromApi(uraArray)
        }
      } catch (error) {
        console.error('Erro ao buscar dados da API ura.json:', error)
      }
    }

    fetchFeedbackData()
    fetchUraData()
  }, [])

  // Calcular o total de feedbacks recebidos combinando ambas as APIs
  const totalFeedbacks = feedbackDataFromApi.length + uraDataFromApi.length

  // Preparar os dados para o gráfico de feedbacks recebidos
  const feedbackChartData = {
    labels: [...(feedbackDataFromApi as FeedbackItem[]).map(f => new Date(f.createdAt).toLocaleDateString('pt-BR')),
             ...(uraDataFromApi as FeedbackItem[]).map(f => new Date(f.createdAt).toLocaleDateString('pt-BR'))], // Combine os labels de ambas APIs
    datasets: [
      {
        label: 'Feedbacks Recebidos',
        data: [...(feedbackDataFromApi as FeedbackItem[]).map(f => f.rating ?? 0),
               ...(uraDataFromApi as FeedbackItem[]).map(f => f.rating ?? 0)], // Combine os dados de ambas APIs
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  }

  const userActivityData = {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Usuários Ativos',
        data: [3000, 3500, 4000, 3800, 4200, 3700, 3200],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
    ],
  }

  const satisfactionData = {
    labels: ['Muito Satisfeito', 'Satisfeito', 'Neutro', 'Insatisfeito', 'Muito Insatisfeito'],
    datasets: [
      {
        data: [300, 200, 100, 50, 20],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
      },
    ],
  }

  const recentActivity = [
    { id: 1, user: 'João Silva', action: 'deixou um feedback', time: '5 min atrás' },
    { id: 2, user: 'Maria Santos', action: 'atualizou o perfil', time: '10 min atrás' },
    { id: 3, user: 'Carlos Oliveira', action: 'fez uma compra', time: '15 min atrás' },
    { id: 4, user: 'Ana Rodrigues', action: 'entrou em contato com o suporte', time: '30 min atrás' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
      <div className="container mx-auto p-6 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" className="bg-white bg-opacity-80 backdrop-blur-sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="bg-white bg-opacity-80 backdrop-blur-sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Avatar>
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">10,482</div>
              <Progress value={78} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                +20.1% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.6</div>
              <Progress value={92} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                +0.2 em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Feedbacks Recebidos</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFeedbacks}</div>
              <Progress value={totalFeedbacks * 10} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                +15% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18.2%</div>
              <Progress value={82} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                +5.4% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Feedbacks</CardTitle>
              <CardDescription>Gerencie e analise feedbacks</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2">Visualize e responda aos feedbacks dos usuários.</p>
              <Link href="/feedback">
                <Button className="w-full">
                  Ver Feedbacks
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Feedbacks Voice</CardTitle>
              <CardDescription>Gerencie e analise feedbacks de voz</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2">Visualize e responda aos feedbacks de voz dos usuários.</p>
              <Link href="/feedback-voice">
                <Button className="w-full">
                  Ver Feedbacks Voice
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Feedbacks Recebidos</CardTitle>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <Bar 
                data={feedbackChartData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: false,
                    },
                  },
                }} 
              />
            </CardContent>
          </Card>
          <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Atividade de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <Line 
                data={userActivityData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: false,
                    },
                  },
                }} 
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-white bg-opacity-80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{activity.user[0]}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{activity.user}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.action}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-sm text-muted-foreground">
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white bg-opacity-80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Satisfação do Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <Doughnut 
                data={satisfactionData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    },
                  },
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
