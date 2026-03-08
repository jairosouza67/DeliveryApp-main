import { supabase } from "@/integrations/supabase/client";
import type { AdminUser, UserRole } from "./types";

export const USER_QUERY_KEY = ["users"] as const;

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase.functions.invoke("list-users");
  if (error) throw new Error(`Erro ao buscar usuarios: ${error.message}`);
  return data.users;
}

export async function updateAdminUserRole(params: { userId: string; role: UserRole | null }): Promise<void> {
  const { error } = await supabase
    .from("user_roles")
    .upsert({ user_id: params.userId, role: params.role }, { onConflict: "user_id" });

  if (error) throw new Error(`Erro ao atualizar papel: ${error.message}`);
}
