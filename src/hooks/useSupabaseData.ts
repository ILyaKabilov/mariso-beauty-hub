import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type Master = Database['public']['Tables']['masters']['Row'];
export type Service = Database['public']['Tables']['services']['Row'];
export type MasterService = Database['public']['Tables']['master_services']['Row'];
export type Appointment = Database['public']['Tables']['appointments']['Row'];
export type Contact = Database['public']['Tables']['salon_contacts']['Row'];

// Fetch all masters
export const useMasters = () => {
  return useQuery({
    queryKey: ['masters'],
    queryFn: async () => {
      const { data, error } = await supabase.from('masters').select('*').order('order_index', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

// Fetch all services
export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase.from('services').select('*').order('order_index', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

// Fetch master-services relations
export const useMasterServices = () => {
  return useQuery({
    queryKey: ['master_services'],
    queryFn: async () => {
      const { data, error } = await supabase.from('master_services').select('*');
      if (error) throw error;
      return data;
    },
  });
};

// Fetch appointments for a specific master on a specific date to calculate availability
export const useAppointmentsForMaster = (masterId: string | null, dateISO: string | null) => {
  return useQuery({
    queryKey: ['appointments', masterId, dateISO],
    queryFn: async () => {
      if (!masterId || !dateISO) return [];
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('master_id', masterId)
        .eq('date', dateISO)
        .neq('status', 'cancelled'); // We don't care about cancelled appointments for availability
      if (error) throw error;
      return data;
    },
    enabled: !!masterId && !!dateISO,
  });
};

// Fetch all categories
export const useCategories = () => {
  return useQuery({
    queryKey: ['service_categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('service_categories').select('*').order('order_index', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

// Fetch admin chats
export const useAdminChats = () => {
  return useQuery({
    queryKey: ['admin_chats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('admin_chats').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

// Fetch contacts
export const useContacts = () => {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('salon_contacts').select('*').single();
      // Even if error (like table missing), just return null for graceful failure
      return data;
    },
  });
};

// Helper function to format services nicely grouped by category
export const getGroupedServices = (services: Service[], categories: Database['public']['Tables']['service_categories']['Row'][] = []) => {
  const grouped: Record<string, Service[]> = {};
  
  // Group by category_id
  services.forEach((s) => {
    const catId = s.category_id || 'unassigned';
    if (!grouped[catId]) {
      grouped[catId] = [];
    }
    grouped[catId].push(s);
  });
  
  const result: { id: string, name_ru: string, name_uz: string, image?: string, services: Service[] }[] = [];
  
  // First add all categories (even empty ones)
  categories.forEach(cat => {
    result.push({
      id: cat.id,
      name_ru: cat.name_ru,
      name_uz: cat.name_uz,
      image: cat.image || undefined,
      services: grouped[cat.id] || [],
    });
  });

  // Then add any services without a known category (unassigned or deleted category)
  Object.entries(grouped).forEach(([catId, svcs]) => {
    if (!categories.find(c => c.id === catId)) {
      result.push({
        id: catId,
        name_ru: 'Без категории',
        name_uz: 'Kategoriyasiz',
        services: svcs,
      });
    }
  });

  return result;
};
