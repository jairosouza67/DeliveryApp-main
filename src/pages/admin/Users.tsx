import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  useAdminUsersQuery,
  useUpdateAdminUserRoleMutation,
  type AdminUser,
  type UserRole,
} from "@/lib/admin";

const ROLES: UserRole[] = ["admin", "seller", "user"];

export default function UsersPage() {
  const { data: users, isLoading, error } = useAdminUsersQuery();
  const mutation = useUpdateAdminUserRoleMutation();

  const handleRoleChange = (userId: string, role: string) => {
    const newRole = role === "null" ? null : (role as UserRole);
    mutation.mutate(
      { userId, role: newRole },
      {
        onSuccess: () => toast.success("Papel do usuário atualizado!"),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Erro ao atualizar papel."),
      },
    );
  };

  if (isLoading) return <AdminLayout title="Usuários" subtitle="Gerenciamento de usuários"><div className="p-4">Carregando...</div></AdminLayout>;
  if (error) return <AdminLayout title="Usuários" subtitle="Gerenciamento de usuários"><div className="p-4 text-red-500">Erro: {error.message}</div></AdminLayout>;

  return (
    <AdminLayout title="Usuários" subtitle="Gerenciamento de usuários">
      <Card>
        <CardHeader><CardTitle>Lista de Usuários</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead className="w-[200px]">Papel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Select value={user.role ?? "null"} onValueChange={(value) => handleRoleChange(user.id, value)} disabled={mutation.isPending}>
                      <SelectTrigger><SelectValue placeholder="Definir papel" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">Usuário Padrão</SelectItem>
                        {ROLES.map((role) => <SelectItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
