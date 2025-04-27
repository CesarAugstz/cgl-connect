'use client'

import { useRouter } from 'next/navigation'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Share2, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface DashboardCardProps {
  dashboard: {
    id: string
    name: string
    description?: string | null
    isPublic: boolean
    owner: {
      name?: string | null
    }
    _count?: {
      devices: number
    }
  }
  onEdit: () => void
  onShare: () => void
}

export default function DashboardCard({ dashboard, onEdit, onShare }: DashboardCardProps) {
  const router = useRouter()
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {dashboard.name}
              {dashboard.isPublic && (
                <Badge variant="outline" className="text-xs">Público</Badge>
              )}
            </CardTitle>
            <CardDescription>
              {dashboard.description || 'Nenhuma descrição fornecida'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="text-sm">
          <p className="text-muted-foreground">
            Dispositivos: {dashboard._count?.devices || 0}
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push(`/dashboard/${dashboard.id}`)}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Visualizar
        </Button>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
