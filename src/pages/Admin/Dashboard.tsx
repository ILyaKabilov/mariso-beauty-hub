import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle, Clock, Plus, Trash2, Edit2 } from "lucide-react";
import { useMasters, useServices } from "@/hooks/useSupabaseData";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const { data: masters, isLoading: mastersLoading } = useMasters();
  const { data: services, isLoading: servicesLoading } = useServices();

  const [editApp, setEditApp] = useState<any>(null);

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["admin_appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("date", { ascending: false })
        .order("start_time", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_appointments"] });
      toast.success("Статус обновлен");
    },
    onError: (err: any) => {
      toast.error(err.message || "Ошибка обновления статуса");
    },
  });

  const deleteAppMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("appointments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_appointments"] });
      toast.success("Запись удалена");
    },
    onError: (err: any) => toast.error(err.message || "Ошибка удаления"),
  });

  const updateAppMutation = useMutation({
    mutationFn: async (data: any) => {
      const { id, ...updates } = data;
      const { error } = await supabase.from("appointments").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_appointments"] });
      toast.success("Запись обновлена");
      setEditApp(null);
    },
    onError: (err: any) => toast.error(err.message || "Ошибка обновления"),
  });

  if (mastersLoading || servicesLoading || appointmentsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-100 px-2 py-1 rounded-md text-xs font-medium"><Clock size={12} /> Ожидает</span>;
      case "confirmed":
        return <span className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-md text-xs font-medium"><CheckCircle2 size={12} /> Подтверждена</span>;
      case "cancelled":
        return <span className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded-md text-xs font-medium"><XCircle size={12} /> Отменена</span>;
      case "completed":
        return <span className="flex items-center gap-1 text-blue-600 bg-blue-100 px-2 py-1 rounded-md text-xs font-medium"><CheckCircle2 size={12} /> Завершена</span>;
      default:
        return status;
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppMutation.mutate({
      id: editApp.id,
      client_name: editApp.client_name,
      client_phone: editApp.client_phone,
      comment: editApp.comment,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold">Все записи</h1>
        <Button asChild className="flex items-center gap-2">
          <Link to="/booking">
            <Plus size={16} /> Создать запись
          </Link>
        </Button>
      </div>
      
      <div className="bg-card rounded-2xl shadow-soft border border-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Клиент</th>
              <th className="px-6 py-4 font-medium">Дата / Время</th>
              <th className="px-6 py-4 font-medium">Услуга / Мастер</th>
              <th className="px-6 py-4 font-medium">Статус</th>
              <th className="px-6 py-4 font-medium text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {appointments?.map((app) => {
              const master = masters?.find((m) => m.id === app.master_id);
              const service = services?.find((s) => s.id === app.service_id);
              
              return (
                <tr key={app.id} className="hover:bg-muted/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground flex items-center gap-2">
                      {app.client_name}
                      <button onClick={() => setEditApp(app)} className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 size={12} />
                      </button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{app.client_phone}</div>
                    {app.comment && <div className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]" title={app.comment}>💬 {app.comment}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{format(new Date(app.date), "dd.MM.yyyy")}</div>
                    <div className="text-xs text-muted-foreground mt-1">{app.start_time.slice(0, 5)} - {app.end_time.slice(0, 5)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{service?.name_ru || "Неизвестная услуга"}</div>
                    <div className="text-xs text-muted-foreground mt-1">{master?.name_ru || "Неизвестный мастер"}</div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(app.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {app.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => updateStatusMutation.mutate({ id: app.id, status: "confirmed" })}>
                            Принять
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateStatusMutation.mutate({ id: app.id, status: "cancelled" })}>
                            Отменить
                          </Button>
                        </>
                      )}
                      {app.status === "confirmed" && (
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateStatusMutation.mutate({ id: app.id, status: "cancelled" })}>
                          Отменить
                        </Button>
                      )}
                      {(app.status === "completed" || app.status === "cancelled") && (
                        <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive h-8 w-8" onClick={() => { if (confirm("Удалить запись навсегда?")) deleteAppMutation.mutate(app.id); }}>
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {appointments?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                  Записей пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editApp} onOpenChange={(v) => !v && setEditApp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирование записи</DialogTitle>
          </DialogHeader>
          {editApp && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label>Имя клиента</Label>
                <Input value={editApp.client_name} onChange={(e) => setEditApp({...editApp, client_name: e.target.value})} />
              </div>
              <div>
                <Label>Телефон</Label>
                <Input value={editApp.client_phone} onChange={(e) => setEditApp({...editApp, client_phone: e.target.value})} />
              </div>
              <div>
                <Label>Комментарий</Label>
                <Textarea value={editApp.comment || ""} onChange={(e) => setEditApp({...editApp, comment: e.target.value})} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditApp(null)}>Отмена</Button>
                <Button type="submit" disabled={updateAppMutation.isPending}>Сохранить</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

