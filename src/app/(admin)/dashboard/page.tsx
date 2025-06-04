
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, HomeIcon, Settings, BarChart3, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  // These would come from backend/data fetching in a real app
  const stats = {
    totalUsers: 1234,
    totalProperties: 567,
    pendingApprovals: 12,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Super Administrador</h1>
        <p className="text-muted-foreground">Bienvenido al panel de control central de Hommie.cl AI.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuarios</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Usuarios registrados en la plataforma.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Propiedades</CardTitle>
            <HomeIcon className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Propiedades activas y en revisión.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propiedades Pendientes</CardTitle>
            <ListChecks className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Propiedades esperando revisión/aprobación.</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Accesos directos a tareas comunes de administración.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button variant="outline" disabled className="w-full">
            <Users className="mr-2 h-4 w-4" /> Gestionar Usuarios (Próx.)
          </Button>
          <Button variant="outline" disabled className="w-full">
            <HomeIcon className="mr-2 h-4 w-4" /> Gestionar Propiedades (Próx.)
          </Button>
          <Button variant="outline" disabled className="w-full">
            <Settings className="mr-2 h-4 w-4" /> Configuración General (Próx.)
          </Button>
           <Button variant="outline" disabled className="w-full">
            <BarChart3 className="mr-2 h-4 w-4" /> Ver Reportes (Próx.)
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
