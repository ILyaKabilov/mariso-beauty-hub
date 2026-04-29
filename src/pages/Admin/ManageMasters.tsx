import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useMasters, useServices, useMasterServices } from "@/hooks/useSupabaseData";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const ManageMasters = () => {
  const queryClient = useQueryClient();
  const { data: masters, isLoading: mastersLoading } = useMasters();
  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: masterServices, isLoading: msLoading } = useMasterServices();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaster, setEditingMaster] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name_ru: "",
    name_uz: "",
    role_ru: "",
    role_uz: "",
    experience: 0,
    image: "",
    bio_ru: "",
    bio_uz: "",
    tg_chat_id: "",
    work_time_start: "09:00",
    work_time_end: "20:00",
    order_index: 0,
  });
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const handleOpenDialog = (master?: any) => {
    if (master) {
      setEditingMaster(master);
      setFormData({
        name_ru: master.name_ru,
        name_uz: master.name_uz,
        role_ru: master.role_ru,
        role_uz: master.role_uz,
        experience: master.experience,
        image: master.image,
        bio_ru: master.bio_ru,
        bio_uz: master.bio_uz,
        tg_chat_id: master.tg_chat_id || "",
        work_time_start: master.work_time_start,
        work_time_end: master.work_time_end,
        order_index: master.order_index || 0,
      });
      // Find assigned services
      const assigned = masterServices?.filter(ms => ms.master_id === master.id).map(ms => ms.service_id) || [];
      setSelectedServiceIds(assigned);
    } else {
      setEditingMaster(null);
      setFormData({
        name_ru: "", name_uz: "", role_ru: "", role_uz: "", experience: 0, image: "", bio_ru: "", bio_uz: "", tg_chat_id: "", work_time_start: "09:00", work_time_end: "20:00", order_index: 0
      });
      setSelectedServiceIds([]);
    }
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      let finalImageUrl = formData.image;
      
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('master_photos').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('master_photos').getPublicUrl(fileName);
        finalImageUrl = publicUrl;
      }

      let masterId = editingMaster?.id;
      const payload = { ...formData, image: finalImageUrl };

      if (masterId) {
        // Update
        const { error } = await supabase.from('masters').update(payload).eq('id', masterId);
        if (error) throw error;
        
        // Update services (delete old, insert new)
        await supabase.from('master_services').delete().eq('master_id', masterId);
      } else {
        // Insert
        const { data, error } = await supabase.from('masters').insert({ ...payload, work_schedule: ["1","2","3","4","5"] }).select().single();
        if (error) throw error;
        masterId = data.id;
      }

      // Insert selected services
      if (selectedServiceIds.length > 0) {
        const msInserts = selectedServiceIds.map(sid => ({ master_id: masterId, service_id: sid }));
        const { error: msError } = await supabase.from('master_services').insert(msInserts);
        if (msError) throw msError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["masters"] });
      queryClient.invalidateQueries({ queryKey: ["master_services"] });
      toast.success(editingMaster ? "Мастер обновлен" : "Мастер добавлен");
      setIsDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Ошибка сохранения"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('masters').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["masters"] });
      queryClient.invalidateQueries({ queryKey: ["master_services"] });
      toast.success("Мастер удален");
    },
    onError: (err: any) => toast.error(err.message || "Ошибка удаления"),
  });

  if (mastersLoading || servicesLoading || msLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  const toggleService = (id: string) => {
    setSelectedServiceIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold">Мастера</h1>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
          <Plus size={16} /> Добавить
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {masters?.map((m) => (
          <div key={m.id} className="bg-card rounded-2xl p-6 border border-border shadow-soft flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <img src={m.image} alt="" className="w-16 h-16 rounded-xl object-cover" />
              <div>
                <div className="font-bold text-lg">{m.name_ru}</div>
                <div className="text-sm text-muted-foreground">{m.role_ru}</div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground line-clamp-2">
              {m.bio_ru}
            </div>

            <div className="text-xs bg-secondary p-3 rounded-xl space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">График:</span>
                <span className="font-medium">{m.work_time_start.slice(0,5)} - {m.work_time_end.slice(0,5)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Telegram ID:</span>
                <span className="font-medium">{m.tg_chat_id || "—"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-auto pt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenDialog(m)}>
                <Edit2 size={14} className="mr-2" /> Изменить
              </Button>
              <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => { if(confirm("Удалить мастера навсегда?")) deleteMutation.mutate(m.id); }}>
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMaster ? "Редактировать мастера" : "Новый мастер"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Имя (RU)</Label><Input required value={formData.name_ru} onChange={e => setFormData({...formData, name_ru: e.target.value})} /></div>
              <div><Label>Имя (UZ)</Label><Input required value={formData.name_uz} onChange={e => setFormData({...formData, name_uz: e.target.value})} /></div>
              <div><Label>Специализация (RU)</Label><Input required value={formData.role_ru} onChange={e => setFormData({...formData, role_ru: e.target.value})} /></div>
              <div><Label>Специализация (UZ)</Label><Input required value={formData.role_uz} onChange={e => setFormData({...formData, role_uz: e.target.value})} /></div>
              <div><Label>Опыт (лет)</Label><Input required type="number" value={formData.experience} onChange={e => setFormData({...formData, experience: Number(e.target.value)})} /></div>
              <div><Label>Порядок сортировки</Label><Input type="number" value={formData.order_index} onChange={e => setFormData({...formData, order_index: Number(e.target.value)})} /></div>
              <div className="col-span-2">
                <Label>Фото мастера</Label>
                <Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} required={!editingMaster} />
                {editingMaster && <p className="text-xs text-muted-foreground mt-1">Выберите файл, только если хотите заменить текущее фото</p>}
              </div>
              <div><Label>Начало работы (HH:MM)</Label><Input required value={formData.work_time_start} onChange={e => setFormData({...formData, work_time_start: e.target.value})} /></div>
              <div><Label>Конец работы (HH:MM)</Label><Input required value={formData.work_time_end} onChange={e => setFormData({...formData, work_time_end: e.target.value})} /></div>
              <div className="col-span-2"><Label>Telegram Chat ID (Обязательно)</Label><Input required value={formData.tg_chat_id} onChange={e => setFormData({...formData, tg_chat_id: e.target.value})} /></div>
              <div className="col-span-2"><Label>Биография (RU)</Label><Textarea required value={formData.bio_ru} onChange={e => setFormData({...formData, bio_ru: e.target.value})} /></div>
              <div className="col-span-2"><Label>Биография (UZ)</Label><Textarea required value={formData.bio_uz} onChange={e => setFormData({...formData, bio_uz: e.target.value})} /></div>
            </div>

            <div>
              <Label className="mb-2 block">Оказываемые услуги</Label>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border p-4 rounded-xl">
                {services?.map(s => (
                  <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted p-1 rounded">
                    <input type="checkbox" checked={selectedServiceIds.includes(s.id)} onChange={() => toggleService(s.id)} />
                    {s.name_ru}
                  </label>
                ))}
              </div>
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
