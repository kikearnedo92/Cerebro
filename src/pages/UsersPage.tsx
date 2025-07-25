import { useAuth } from "@/hooks/useAuth";
import CerebroUserManager from "@/components/admin/CerebroUserManager";

export default function UsersPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Por favor inicia sesión para acceder a esta página.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Usuarios Cerebro</h1>
          <p className="text-gray-600">Administra usuarios que pueden acceder a Cerebro</p>
        </div>
        <CerebroUserManager />
      </div>
    </div>
  );
}