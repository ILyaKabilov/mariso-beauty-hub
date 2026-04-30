import { useMemo, useState, FormEvent, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, X, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  useMasters,
  useServices,
  useMasterServices,
  useAppointmentsForMaster,
  getGroupedServices,
} from "@/hooks/useSupabaseData";

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Convert "HH:MM" or "HH:MM:SS" to minutes since midnight
function timeToMinutes(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// Convert minutes since midnight to "HH:MM"
function minutesToTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const BookingPage = () => {
  const { t, lang } = useI18n();
  const [params] = useSearchParams();
  const initialMaster = params.get("master") || "";

  const { data: masters, isLoading: mastersLoading } = useMasters();
  const { data: allServices, isLoading: servicesLoading } = useServices();
  const { data: masterServices, isLoading: msLoading } = useMasterServices();

  const [masterId, setMasterId] = useState(initialMaster);
  const [serviceId, setServiceId] = useState<string>("");
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>(toISODate(new Date()));
  const [selectedTime, setSelectedTime] = useState<string>("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  // When masters load and none selected, select first
  useEffect(() => {
    if (masters && masters.length > 0 && !masterId) {
      setMasterId(masters[0].id);
    }
  }, [masters, masterId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // When master changes, reset service, date, time
  useEffect(() => {
    setServiceId("");
    setSelectedTime("");
  }, [masterId]);

  // When service changes, reset time
  useEffect(() => {
    setSelectedTime("");
  }, [serviceId]);

  // When date changes, reset time
  useEffect(() => {
    setSelectedTime("");
  }, [selectedDate]);

  const today = new Date();
  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const selectedMaster = masters?.find((m) => m.id === masterId);
  const selectedService = allServices?.find((s) => s.id === serviceId);

  // Available services for the selected master
  const availableServices = useMemo(() => {
    if (!masterId || !allServices || !masterServices) return [];
    const masterServiceIds = masterServices.filter((ms) => ms.master_id === masterId).map((ms) => ms.service_id);
    return allServices.filter((s) => masterServiceIds.includes(s.id));
  }, [masterId, allServices, masterServices]);

  const groupedAvailableServices = useMemo(() => getGroupedServices(availableServices), [availableServices]);

  const { data: appointments } = useAppointmentsForMaster(masterId, selectedDate);

  // Calculate available time slots for the selected date
  const availableSlots = useMemo(() => {
    if (!selectedMaster || !selectedService || !selectedDate) return [];
    
    // Check if the master works on this day of the week
    const dateObj = new Date(selectedDate);
    const dayOfWeek = String(dateObj.getDay() === 0 ? 7 : dateObj.getDay()); // 1-Mon, 7-Sun
    
    const scheduleArr = Array.isArray(selectedMaster.work_schedule) ? selectedMaster.work_schedule : ["1","2","3","4","5"];
    if (!scheduleArr.includes(dayOfWeek)) {
      return []; // Not working this day
    }

    const startMin = timeToMinutes(selectedMaster.work_time_start || '09:00');
    const endMin = timeToMinutes(selectedMaster.work_time_end || '20:00');
    const duration = selectedService.duration;

    // Generate possible slots stepping by the actual duration of the service
    // This ensures slots directly correspond to the chosen service and visibly recalculate
    const step = duration; 
    const possibleSlots: number[] = [];
    for (let t = startMin; t + duration <= endMin; t += step) {
      possibleSlots.push(t);
    }

    // Filter out slots that overlap with existing appointments or are in the past
    const now = new Date();
    const isToday = selectedDate === toISODate(now);
    const currentMin = now.getHours() * 60 + now.getMinutes();

    const existingAppointments = (appointments || []).map(app => ({
      start: timeToMinutes(app.start_time),
      end: timeToMinutes(app.end_time)
    }));

    const validSlots = possibleSlots.map(slotStart => {
      const slotEnd = slotStart + duration;

      if (isToday && slotStart <= currentMin + 30) {
        return { time: minutesToTime(slotStart), busy: true }; // Require at least 30 min advance booking for today
      }

      // Check overlap
      const isOverlapping = existingAppointments.some(app => {
        return (slotStart < app.end && slotEnd > app.start);
      });

      return { time: minutesToTime(slotStart), busy: isOverlapping };
    });

    return validSlots;
  }, [selectedMaster, selectedService, selectedDate, appointments]);

  // Build calendar grid (Mon-first)
  const calendarDays = useMemo(() => {
    const first = new Date(year, month, 1);
    const startWeekday = (first.getDay() + 6) % 7; // Mon=0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  const todayISO = toISODate(new Date());

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !masterId || !serviceId || !selectedDate || !selectedTime) {
      toast.error(t("booking.pickAll"));
      return;
    }
    setSending(true);
    try {
      const master = masters?.find((m) => m.id === masterId);
      const service = allServices?.find((s) => s.id === serviceId);
      
      if (!master || !service) throw new Error("Invalid selection");

      // Calculate end time
      const startMin = timeToMinutes(selectedTime);
      const endMin = startMin + service.duration;
      const endTimeStr = minutesToTime(endMin) + ":00"; // format for TIME field in PG

      // Insert into appointments table
      const { data: appointmentData, error: dbError } = await supabase.from('appointments').insert({
        master_id: masterId,
        service_id: serviceId,
        client_name: name.trim(),
        client_phone: phone.trim(),
        comment: comment.trim(),
        date: selectedDate,
        start_time: selectedTime + ":00",
        end_time: endTimeStr,
        status: 'pending'
      }).select().single();

      if (dbError) throw dbError;

      // Invoke the Edge Function to send Telegram notification with the new appointment ID
      const { data, error } = await supabase.functions.invoke("send-booking", {
        body: {
          appointment_id: appointmentData.id, // we will need this for the callback query later
          name: name.trim(),
          phone: phone.trim(),
          service: service.name_ru,
          master: master.name_ru,
          date: selectedDate,
          time: selectedTime,
          comment: (comment || "").trim(),
          lang,
        },
      });
      if (error || (data && data.error)) throw new Error(error?.message || data?.error);
      
      toast.success(t("booking.success"));
      setName(""); setPhone(""); setComment(""); setSelectedTime(""); setServiceId("");
    } catch (err) {
      console.error(err);
      toast.error(t("booking.error"));
    } finally {
      setSending(false);
    }
  };

  const dayNames = ["days.mon", "days.tue", "days.wed", "days.thu", "days.fri", "days.sat", "days.sun"];

  if (mastersLoading || servicesLoading || msLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>;
  }

  return (
    <>
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="container mx-auto text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">MariSo</div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl">{t("booking.title")}</h1>
          <p className="mt-4 opacity-80 max-w-xl mx-auto">{t("booking.subtitle")}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto grid lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Left: Master + Services + Calendar */}
          <div className="lg:col-span-3 space-y-10">
            
            {/* 1. Masters */}
            <div>
              <h2 className="font-display text-2xl mb-5 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
                {t("booking.selectMaster")}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {masters?.map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setMasterId(m.id)}
                    className={`flex items-center gap-4 p-3 rounded-2xl border text-left transition-all ${
                      masterId === m.id
                        ? "border-primary bg-secondary shadow-soft"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <img src={m.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      {/* Note: since we only have name_ru/name_uz in DB now, fallback to ru if lang isn't uz */}
                      <div className="font-medium truncate">{lang === 'uz' ? m.name_uz : m.name_ru}</div>
                      <div className="text-xs text-muted-foreground">{lang === 'uz' ? m.role_uz : m.role_ru}</div>
                    </div>
                    {masterId === m.id && <Check className="text-primary shrink-0" size={18} />}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Services */}
            {masterId && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="font-display text-2xl mb-5 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
                  {t("booking.service")}
                </h2>
                {availableServices.length === 0 ? (
                  <p className="text-muted-foreground">{t("booking.noSlots")}</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {availableServices.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => setServiceId(s.id)}
                        className={`flex flex-col gap-1 p-4 rounded-2xl border text-left transition-all relative ${
                          serviceId === s.id
                            ? "border-primary bg-secondary shadow-soft"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <div className="font-medium pr-6">{lang === 'uz' ? s.name_uz : s.name_ru}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{s.duration} мин</span>
                          <span>•</span>
                          <span>{s.price.toLocaleString()} {t("services.sum")}</span>
                        </div>
                        {serviceId === s.id && <Check className="text-primary absolute top-4 right-4" size={18} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Calendar & Time */}
            {serviceId && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                <div>
                  <h2 className="font-display text-2xl mb-5 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
                    {t("booking.calendar")}
                  </h2>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" onClick={() => setMonthOffset((v) => Math.max(0, v - 1))} disabled={monthOffset === 0}>
                        <ChevronLeft size={16} />
                      </Button>
                      <div className="font-medium text-sm w-36 text-center">
                        {t(`months.${month}`)} {year}
                      </div>
                      <Button size="icon" variant="outline" onClick={() => setMonthOffset((v) => v + 1)}>
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl p-3 sm:p-5 shadow-soft border border-border">
                    <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      {dayNames.map((d) => <div key={d} className="py-2">{t(d)}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                      {calendarDays.map((d, i) => {
                        if (!d) return <div key={i} />;
                        const iso = toISODate(d);
                        const past = iso < todayISO;
                        const selected = iso === selectedDate;
                        // we do not calculate day availability count preemptively here anymore due to complexity, 
                        // we just allow selection of future dates and then show available times below.
                        return (
                          <button
                            type="button"
                            key={i}
                            disabled={past}
                            onClick={() => setSelectedDate(iso)}
                            className={`aspect-square rounded-lg text-sm flex flex-col items-center justify-center transition-all relative ${
                              past
                                ? "text-muted-foreground/40 cursor-not-allowed"
                                : selected
                                ? "bg-primary text-primary-foreground shadow-elegant"
                                : "hover:bg-secondary text-foreground"
                            }`}
                          >
                            <span className="font-medium">{d.getDate()}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Time slots */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="font-display text-2xl mb-5 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">4</span>
                    {t("booking.selectTime")}
                  </h2>
                  {availableSlots.length === 0 || availableSlots.every(s => s.busy) ? (
                    <div className="p-6 text-center text-muted-foreground bg-secondary rounded-2xl">
                      {t("booking.noSlots")}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 sm:gap-2">
                      {availableSlots.map((slot) => {
                        const selected = selectedTime === slot.time;
                        return (
                          <button
                            type="button"
                            key={slot.time}
                            disabled={slot.busy}
                            onClick={() => setSelectedTime(slot.time)}
                            className={`py-2 sm:py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1 border ${
                              slot.busy
                                ? "bg-muted text-muted-foreground/50 line-through cursor-not-allowed border-transparent"
                                : selected
                                ? "bg-primary text-primary-foreground border-primary shadow-soft"
                                : "bg-card border-border hover:border-primary hover:text-primary"
                            }`}
                          >
                            {slot.busy && <X size={12} />}
                            {slot.time}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-card p-6 md:p-8 rounded-3xl shadow-elegant border border-border lg:sticky lg:top-28"
            >
              <h2 className="font-display text-3xl mb-1">{t("booking.title")}</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-6">MariSo · Tashkent</p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">{t("booking.name")}</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="phone">{t("booking.phone")}</Label>
                  <Input id="phone" type="tel" placeholder="+998 __ ___ __ __" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} required className="mt-1.5" />
                </div>
                
                <div>
                  <Label htmlFor="comment">{t("booking.comment")}</Label>
                  <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} placeholder={t("booking.commentPh")} className="mt-1.5" rows={3} />
                </div>

                <div className="flex flex-col gap-2 text-sm bg-secondary rounded-xl p-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("booking.service")}</span>
                    <span className="font-medium text-right max-w-[60%]">
                      {selectedService ? (lang === 'uz' ? selectedService.name_uz : selectedService.name_ru) : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("booking.selectMaster")}</span>
                    <span className="font-medium text-right max-w-[60%]">
                      {selectedMaster ? (lang === 'uz' ? selectedMaster.name_uz : selectedMaster.name_ru) : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border/50">
                    <span className="text-muted-foreground">{t("booking.selectDate")}</span>
                    <span className="font-medium">
                      {selectedDate} {selectedTime && `· ${selectedTime}`}
                    </span>
                  </div>
                </div>
              </div>

              <Button type="submit" size="lg" disabled={sending || !serviceId || !selectedTime} className="w-full mt-6 bg-primary hover:bg-primary/90 h-12">
                {sending ? <><Loader2 className="animate-spin mr-2" size={16} />{t("booking.sending")}</> : t("booking.submit")}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};
