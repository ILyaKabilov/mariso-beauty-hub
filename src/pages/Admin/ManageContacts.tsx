import { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useContacts } from "@/hooks/useSupabaseData";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const ManageContacts = () => {
  const queryClient = useQueryClient();
  const { data: contacts, isLoading } = useContacts();

  const [formData, setFormData] = useState({
    id: "",
    address_ru: "",
    address_uz: "",
    phone: "",
    working_hours_ru: "",
    working_hours_uz: "",
    instagram: "",
    telegram: "",
    map_url: "",
  });

  useEffect(() => {
    if (contacts) {
      setFormData({
        id: contacts.id,
        address_ru: contacts.address_ru,
        address_uz: contacts.address_uz,
        phone: contacts.phone,
        working_hours_ru: contacts.working_hours_ru,
        working_hours_uz: contacts.working_hours_uz,
        instagram: contacts.instagram || "",
        telegram: contacts.telegram || "",
        map_url: contacts.map_url || "",
      });
    } else if (!isLoading) {
      setFormData({
        id: "",
        address_ru: "г. Ташкент, ул. Амира Темура, 55",
        address_uz: "Toshkent sh., Amir Temur ko'chasi, 55",
        phone: "+998 71 200 00 00",
        working_hours_ru: "Ежедневно с 9:00 до 21:00",
        working_hours_uz: "Har kuni 9:00 dan 21:00 gacha",
        instagram: "https://instagram.com/mariso.tashkent",
        telegram: "https://t.me/mariso_bot",
        map_url: "https://www.openstreetmap.org/export/embed.html?bbox=69.24%2C41.29%2C69.32%2C41.33&layer=mapnik&marker=41.311%2C69.279",
      });
    }
  }, [contacts, isLoading]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { id, ...payload } = formData;
      if (id) {
        const { error } = await supabase.from('salon_contacts').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('salon_contacts').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Контакты сохранены");
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-display font-bold mb-8">Контакты</h1>
      <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-6 bg-card p-8 rounded-2xl shadow-soft border border-border">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Телефон</Label>
            <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+998 90 123 45 67" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <Label>Адрес (RU)</Label>
            <Input required value={formData.address_ru} onChange={e => setFormData({...formData, address_ru: e.target.value})} />
          </div>
          <div className="col-span-2 md:col-span-1">
            <Label>Адрес (UZ)</Label>
            <Input required value={formData.address_uz} onChange={e => setFormData({...formData, address_uz: e.target.value})} />
          </div>
          <div className="col-span-2 md:col-span-1">
            <Label>Часы работы (RU)</Label>
            <Input required value={formData.working_hours_ru} onChange={e => setFormData({...formData, working_hours_ru: e.target.value})} />
          </div>
          <div className="col-span-2 md:col-span-1">
            <Label>Часы работы (UZ)</Label>
            <Input required value={formData.working_hours_uz} onChange={e => setFormData({...formData, working_hours_uz: e.target.value})} />
          </div>
          <div className="col-span-2 md:col-span-1">
            <Label>Instagram (ссылка)</Label>
            <Input value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} placeholder="https://instagram.com/..." />
          </div>
          <div className="col-span-2 md:col-span-1">
            <Label>Telegram (ссылка)</Label>
            <Input value={formData.telegram} onChange={e => setFormData({...formData, telegram: e.target.value})} placeholder="https://t.me/..." />
          </div>
          <div className="col-span-2">
            <Label>Ссылка на карту (iframe src)</Label>
            <Input value={formData.map_url} onChange={e => setFormData({...formData, map_url: e.target.value})} placeholder="https://yandex.ru/map-widget/v1/..." />
            <p className="text-xs text-muted-foreground mt-1">Вставьте ссылку из тега src iframe яндекс/google/osm карт.</p>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? "Сохранение..." : "Сохранить изменения"}
        </Button>
      </form>
    </div>
  );
};
