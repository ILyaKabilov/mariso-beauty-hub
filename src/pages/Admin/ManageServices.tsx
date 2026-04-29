import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useServices, useCategories, getGroupedServices } from "@/hooks/useSupabaseData";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";
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

export const ManageServices = () => {
  const queryClient = useQueryClient();
  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  // Service Dialog
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [serviceForm, setServiceForm] = useState({
    name_ru: "", name_uz: "", price: 0, duration: 60, category_id: "", order_index: 0
  });

  // Category Dialog
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryForm, setCategoryForm] = useState({
    name_ru: "", name_uz: "", order_index: 0, image: ""
  });
  const [catImageFile, setCatImageFile] = useState<File | null>(null);

  const handleOpenServiceDialog = (service?: any) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        name_ru: service.name_ru,
        name_uz: service.name_uz,
        price: service.price,
        duration: service.duration,
        category_id: service.category_id || (categories ? categories[0]?.id : ""),
        order_index: service.order_index || 0,
      });
    } else {
      setEditingService(null);
      setServiceForm({
        name_ru: "", name_uz: "", price: 100000, duration: 60, category_id: categories ? categories[0]?.id : "", order_index: 0
      });
    }
    setIsServiceDialogOpen(true);
  };

  const handleOpenCategoryDialog = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name_ru: category.name_ru, name_uz: category.name_uz, order_index: category.order_index || 0, image: category.image || "" });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name_ru: "", name_uz: "", order_index: 0, image: "" });
    }
    setCatImageFile(null);
    setIsCategoryDialogOpen(true);
  };

  const saveServiceMutation = useMutation({
    mutationFn: async () => {
      if (editingService?.id) {
        const { error } = await supabase.from('services').update(serviceForm).eq('id', editingService.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('services').insert(serviceForm);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Услуга сохранена");
      setIsServiceDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const saveCategoryMutation = useMutation({
    mutationFn: async () => {
      let finalImageUrl = categoryForm.image;
      if (catImageFile) {
        const fileExt = catImageFile.name.split('.').pop();
        const fileName = `cat_${Date.now()}_${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('master_photos').upload(fileName, catImageFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('master_photos').getPublicUrl(fileName);
        finalImageUrl = publicUrl;
      }

      const payload = { ...categoryForm, image: finalImageUrl };

      if (editingCategory?.id) {
        const { error } = await supabase.from('service_categories').update(payload).eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('service_categories').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service_categories"] });
      toast.success("Категория сохранена");
      setIsCategoryDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["services"] }); toast.success("Услуга удалена"); },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      // Must delete all services in this category first or change their category, but we just try deleting and if foreign key fails it throws error
      const { error } = await supabase.from('service_categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["service_categories"] }); toast.success("Категория удалена"); },
    onError: () => toast.error("Нельзя удалить категорию, пока в ней есть услуги"),
  });

  if (servicesLoading || categoriesLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  const grouped = getGroupedServices(services || [], categories || []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold">Услуги</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleOpenCategoryDialog()} className="flex items-center gap-2">
            <Plus size={16} /> Категорию
          </Button>
          <Button onClick={() => handleOpenServiceDialog()} className="flex items-center gap-2">
            <Plus size={16} /> Услугу
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {grouped.map((group) => {
          const cat = categories?.find(c => c.id === group.id);
          return (
          <div key={group.id}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{group.name_ru} <span className="text-muted-foreground font-normal text-sm ml-2">/ {group.name_uz}</span></h2>
              {cat && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenCategoryDialog(cat)}><Edit2 size={14} className="mr-2"/> Изменить категорию</Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => { if(confirm("Удалить категорию?")) deleteCategoryMutation.mutate(cat.id); }}><Trash2 size={14}/></Button>
                </div>
              )}
            </div>
            
            <div className="bg-card rounded-2xl shadow-soft border border-border overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-medium">Название (RU/UZ)</th>
                    <th className="px-6 py-4 font-medium">Длительность</th>
                    <th className="px-6 py-4 font-medium">Стоимость</th>
                    <th className="px-6 py-4 font-medium text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {group.services.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium">{s.name_ru}</div>
                        <div className="text-xs text-muted-foreground">{s.name_uz}</div>
                      </td>
                      <td className="px-6 py-4">{s.duration} мин</td>
                      <td className="px-6 py-4 font-medium">{s.price.toLocaleString()} сум</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleOpenServiceDialog(s)}>
                            <Edit2 size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { if(confirm("Удалить услугу?")) deleteServiceMutation.mutate(s.id); }}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {group.services.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-4 text-center text-muted-foreground">Нет услуг</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )})}
      </div>

      {/* Service Dialog */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingService ? "Редактировать услугу" : "Новая услуга"}</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); saveServiceMutation.mutate(); }} className="space-y-4">
            <div><Label>Название (RU)</Label><Input required value={serviceForm.name_ru} onChange={e => setServiceForm({...serviceForm, name_ru: e.target.value})} /></div>
            <div><Label>Название (UZ)</Label><Input required value={serviceForm.name_uz} onChange={e => setServiceForm({...serviceForm, name_uz: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Стоимость (сум)</Label><Input required type="number" value={serviceForm.price} onChange={e => setServiceForm({...serviceForm, price: Number(e.target.value)})} /></div>
              <div><Label>Длительность (мин)</Label><Input required type="number" value={serviceForm.duration} onChange={e => setServiceForm({...serviceForm, duration: Number(e.target.value)})} /></div>
              <div className="col-span-2"><Label>Порядок сортировки</Label><Input type="number" value={serviceForm.order_index} onChange={e => setServiceForm({...serviceForm, order_index: Number(e.target.value)})} /></div>
            </div>
            <div>
              <Label>Категория</Label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
                value={serviceForm.category_id} onChange={e => setServiceForm({...serviceForm, category_id: e.target.value})} required>
                <option value="" disabled>Выберите категорию...</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name_ru}</option>)}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsServiceDialogOpen(false)}>Отмена</Button>
              <Button type="submit" disabled={saveServiceMutation.isPending}>Сохранить</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingCategory ? "Редактировать категорию" : "Новая категория"}</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); saveCategoryMutation.mutate(); }} className="space-y-4">
            <div><Label>Название (RU)</Label><Input required value={categoryForm.name_ru} onChange={e => setCategoryForm({...categoryForm, name_ru: e.target.value})} /></div>
            <div><Label>Название (UZ)</Label><Input required value={categoryForm.name_uz} onChange={e => setCategoryForm({...categoryForm, name_uz: e.target.value})} /></div>
            <div><Label>Порядок сортировки</Label><Input type="number" value={categoryForm.order_index} onChange={e => setCategoryForm({...categoryForm, order_index: Number(e.target.value)})} /></div>
            <div>
              <Label>Фото категории</Label>
              <Input type="file" accept="image/*" onChange={e => setCatImageFile(e.target.files?.[0] || null)} required={!editingCategory} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Отмена</Button>
              <Button type="submit" disabled={saveCategoryMutation.isPending}>Сохранить</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
