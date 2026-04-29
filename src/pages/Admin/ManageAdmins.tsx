import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAdminChats } from "@/hooks/useSupabaseData";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const ManageAdmins = () => {
  const queryClient = useQueryClient();
  const { data: admins, isLoading } = useAdminChats();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ tg_chat_id: "", description: "" });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('admin_chats').insert(formData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_chats"] });
      toast.success("Администратор добавлен");
      setIsDialogOpen(false);
      setFormData({ tg_chat_id: "", description: "" });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('admin_chats').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin_chats"] }); toast.success("Администратор удален"); },
  });

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Администраторы Telegram</h1>
          <p className="text-muted-foreground">Управляйте Chat ID администраторов, которые будут получать уведомления о новых записях в Telegram.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
          <Plus size={16} /> Добавить
        </Button>
      </div>

      <div className="bg-card rounded-2xl shadow-soft border border-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Telegram Chat ID</th>
              <th className="px-6 py-4 font-medium">Описание</th>
              <th className="px-6 py-4 font-medium text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {admins?.map((a) => (
              <tr key={a.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium">{a.tg_chat_id}</td>
                <td className="px-6 py-4 text-muted-foreground">{a.description || "—"}</td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { if(confirm("Удалить администратора?")) deleteMutation.mutate(a.id); }}>
                    <Trash2 size={14} />
                  </Button>
                </td>
              </tr>
            ))}
            {(!admins || admins.length === 0) && (
              <tr><td colSpan={3} className="px-6 py-4 text-center text-muted-foreground">Нет добавленных администраторов</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Добавить администратора</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <div>
              <Label>Telegram Chat ID</Label>
              <Input required placeholder="Например: 123456789" value={formData.tg_chat_id} onChange={e => setFormData({...formData, tg_chat_id: e.target.value})} />
              <p className="text-xs text-muted-foreground mt-1.5">Можно узнать через @userinfobot</p>
            </div>
            <div>
              <Label>Описание (кто это?)</Label>
              <Input placeholder="Менеджер Анна" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
              <Button type="submit" disabled={saveMutation.isPending}>Сохранить</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
