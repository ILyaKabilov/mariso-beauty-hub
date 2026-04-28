import { useMemo, useState, FormEvent, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, X, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { masters, categories, getAvailabilityForDate } from "@/data/salon";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const BookingPage = () => {
  const { t, lang } = useI18n();
  const [params] = useSearchParams();
  const initialMaster = params.get("master") || masters[0].id;

  const [masterId, setMasterId] = useState(initialMaster);
  const [serviceId, setServiceId] = useState<string>("");
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>(toISODate(new Date()));
  const [selectedTime, setSelectedTime] = useState<string>("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const today = new Date();
  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const allServices = useMemo(() => categories.flatMap((c) => c.services), []);

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

  const availability = useMemo(
    () => getAvailabilityForDate(masterId, selectedDate),
    [masterId, selectedDate]
  );

  useEffect(() => {
    setSelectedTime("");
  }, [masterId, selectedDate]);

  const todayISO = toISODate(new Date());

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !serviceId || !selectedDate || !selectedTime) {
      toast.error(t("booking.pickAll"));
      return;
    }
    setSending(true);
    try {
      const master = masters.find((m) => m.id === masterId)!;
      const service = allServices.find((s) => s.id === serviceId)!;
      const { data, error } = await supabase.functions.invoke("send-booking", {
        body: {
          name,
          phone,
          service: service.name.ru,
          master: master.name.ru,
          date: selectedDate,
          time: selectedTime,
          comment,
          lang,
        },
      });
      if (error || (data && data.error)) throw new Error(error?.message || data?.error);
      toast.success(t("booking.success"));
      setName(""); setPhone(""); setComment(""); setSelectedTime("");
    } catch (err) {
      console.error(err);
      toast.error(t("booking.error"));
    } finally {
      setSending(false);
    }
  };

  const dayNames = ["days.mon", "days.tue", "days.wed", "days.thu", "days.fri", "days.sat", "days.sun"];

  return (
    <>
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="container mx-auto text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">MariSo</div>
          <h1 className="font-display text-5xl sm:text-6xl">{t("booking.title")}</h1>
          <p className="mt-4 opacity-80 max-w-xl mx-auto">{t("booking.subtitle")}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto grid lg:grid-cols-5 gap-10">
          {/* Left: Master + Calendar */}
          <div className="lg:col-span-3 space-y-10">
            {/* Masters */}
            <div>
              <h2 className="font-display text-2xl mb-5">{t("booking.selectMaster")}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {masters.map((m) => (
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
                      <div className="font-medium truncate">{m.name[lang]}</div>
                      <div className="text-xs text-muted-foreground">{m.role[lang]}</div>
                    </div>
                    {masterId === m.id && <Check className="text-primary shrink-0" size={18} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-2xl">{t("booking.calendar")}</h2>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" onClick={() => setMonthOffset((v) => Math.max(0, v - 1))} disabled={monthOffset === 0}>
                    <ChevronLeft size={16} />
                  </Button>
                  <div className="font-medium text-sm w-36 text-center">
                    {t(`months.${month}`)} {year}
                  </div>
                  <Button size="icon" variant="outline" onClick={() => setMonthOffset((v) => Math.min(3, v + 1))}>
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
                <div className="grid grid-cols-7 gap-1 text-center text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  {dayNames.map((d) => <div key={d} className="py-2">{t(d)}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((d, i) => {
                    if (!d) return <div key={i} />;
                    const iso = toISODate(d);
                    const past = iso < todayISO;
                    const selected = iso === selectedDate;
                    const dayAvail = getAvailabilityForDate(masterId, iso);
                    const freeCount = dayAvail.filter((s) => !s.busy).length;
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
                        {!past && (
                          <span className={`text-[9px] mt-0.5 ${selected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                            {freeCount > 0 ? `${freeCount} ${t("booking.available").toLowerCase()}` : "—"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-5 mt-5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-accent" />{t("booking.free")}</span>
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />{t("booking.taken")}</span>
                </div>
              </div>
            </div>

            {/* Time slots */}
            <div>
              <h2 className="font-display text-2xl mb-5">{t("booking.selectTime")}</h2>
              {availability.every((s) => s.busy) ? (
                <div className="p-6 text-center text-muted-foreground bg-secondary rounded-2xl">{t("booking.noSlots")}</div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {availability.map((slot) => {
                    const selected = selectedTime === slot.time;
                    return (
                      <button
                        type="button"
                        key={slot.time}
                        disabled={slot.busy}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1 border ${
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

          {/* Right: Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-card p-8 rounded-3xl shadow-elegant border border-border lg:sticky lg:top-28"
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
                  <Label htmlFor="service">{t("booking.service")}</Label>
                  <select
                    id="service"
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    required
                    className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="" disabled>—</option>
                    {categories.map((cat) => (
                      <optgroup key={cat.id} label={t(`cat.${cat.id}`)}>
                        {cat.services.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name[lang]} · {s.price.toLocaleString()} {t("services.sum")}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="comment">{t("booking.comment")}</Label>
                  <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} placeholder={t("booking.commentPh")} className="mt-1.5" rows={3} />
                </div>

                <div className="flex items-center justify-between text-sm bg-secondary rounded-xl p-3">
                  <span className="text-muted-foreground">{t("booking.selectDate")}</span>
                  <span className="font-medium">
                    {selectedDate} {selectedTime && `· ${selectedTime}`}
                  </span>
                </div>
              </div>

              <Button type="submit" size="lg" disabled={sending} className="w-full mt-6 bg-primary hover:bg-primary/90 h-12">
                {sending ? <><Loader2 className="animate-spin mr-2" size={16} />{t("booking.sending")}</> : t("booking.submit")}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};
