import hair from "@/assets/service-hair.jpg";
import manicure from "@/assets/service-manicure.jpg";
import pedicure from "@/assets/service-pedicure.jpg";
import massage from "@/assets/service-massage.jpg";
import m1 from "@/assets/master-1.jpg";
import m2 from "@/assets/master-2.jpg";
import m3 from "@/assets/master-3.jpg";
import m4 from "@/assets/master-4.jpg";

export type Category = "hair" | "manicure" | "pedicure" | "massage" | "other";

export interface ServiceItem {
  id: string;
  category: Category;
  name: { ru: string; uz: string };
  price: number; // in thousand sum
  duration: number; // minutes
}

export interface CategoryInfo {
  id: Category;
  image: string;
  services: ServiceItem[];
}

export const categories: CategoryInfo[] = [
  {
    id: "hair",
    image: hair,
    services: [
      { id: "h1", category: "hair", name: { ru: "Женская стрижка", uz: "Ayollar soch olish" }, price: 180, duration: 60 },
      { id: "h2", category: "hair", name: { ru: "Мужская стрижка", uz: "Erkaklar soch olish" }, price: 120, duration: 45 },
      { id: "h3", category: "hair", name: { ru: "Детская стрижка", uz: "Bolalar soch olish" }, price: 90, duration: 30 },
      { id: "h4", category: "hair", name: { ru: "Укладка", uz: "Soch turmaklash" }, price: 150, duration: 45 },
      { id: "h5", category: "hair", name: { ru: "Окрашивание (1 тон)", uz: "Bo'yash (1 ton)" }, price: 450, duration: 120 },
      { id: "h6", category: "hair", name: { ru: "Мелирование", uz: "Melirovka" }, price: 650, duration: 150 },
    ],
  },
  {
    id: "manicure",
    image: manicure,
    services: [
      { id: "m1", category: "manicure", name: { ru: "Классический маникюр", uz: "Klassik manikyur" }, price: 120, duration: 60 },
      { id: "m2", category: "manicure", name: { ru: "Аппаратный маникюр", uz: "Apparat manikyur" }, price: 150, duration: 60 },
      { id: "m3", category: "manicure", name: { ru: "Маникюр + гель-лак", uz: "Manikyur + gel-lak" }, price: 250, duration: 90 },
      { id: "m4", category: "manicure", name: { ru: "Наращивание ногтей", uz: "Tirnoq uzaytirish" }, price: 400, duration: 150 },
      { id: "m5", category: "manicure", name: { ru: "Дизайн (1 ноготь)", uz: "Dizayn (1 tirnoq)" }, price: 20, duration: 10 },
    ],
  },
  {
    id: "pedicure",
    image: pedicure,
    services: [
      { id: "p1", category: "pedicure", name: { ru: "Классический педикюр", uz: "Klassik pedikyur" }, price: 200, duration: 75 },
      { id: "p2", category: "pedicure", name: { ru: "Аппаратный педикюр", uz: "Apparat pedikyur" }, price: 230, duration: 75 },
      { id: "p3", category: "pedicure", name: { ru: "Педикюр + гель-лак", uz: "Pedikyur + gel-lak" }, price: 320, duration: 105 },
      { id: "p4", category: "pedicure", name: { ru: "SPA-педикюр", uz: "SPA-pedikyur" }, price: 350, duration: 90 },
    ],
  },
  {
    id: "massage",
    image: massage,
    services: [
      { id: "ms1", category: "massage", name: { ru: "Классический массаж", uz: "Klassik massaj" }, price: 280, duration: 60 },
      { id: "ms2", category: "massage", name: { ru: "Релакс-массаж", uz: "Relaks massaj" }, price: 320, duration: 60 },
      { id: "ms3", category: "massage", name: { ru: "Антицеллюлитный", uz: "Antitsellyulit" }, price: 350, duration: 60 },
      { id: "ms4", category: "massage", name: { ru: "Массаж лица", uz: "Yuz massaji" }, price: 220, duration: 40 },
      { id: "ms5", category: "massage", name: { ru: "Стоун-терапия", uz: "Stoun-terapiya" }, price: 400, duration: 75 },
    ],
  },
  {
    id: "other",
    image: massage,
    services: [
      { id: "o1", category: "other", name: { ru: "Чистка лица", uz: "Yuz tozalash" }, price: 300, duration: 60 },
      { id: "o2", category: "other", name: { ru: "Пилинг", uz: "Piling" }, price: 350, duration: 45 },
      { id: "o3", category: "other", name: { ru: "Оформление бровей", uz: "Qosh bichish" }, price: 80, duration: 20 },
      { id: "o4", category: "other", name: { ru: "Окрашивание бровей", uz: "Qosh bo'yash" }, price: 90, duration: 20 },
      { id: "o5", category: "other", name: { ru: "Наращивание ресниц", uz: "Kiprik uzaytirish" }, price: 250, duration: 90 },
    ],
  },
];

export interface Master {
  id: string;
  name: { ru: string; uz: string };
  role: { ru: string; uz: string };
  experience: number;
  specialization: Category[];
  image: string;
  bio: { ru: string; uz: string };
}

export const masters: Master[] = [
  {
    id: "master-1",
    name: { ru: "Мария Ким", uz: "Mariya Kim" },
    role: { ru: "Топ-стилист", uz: "Top-stilist" },
    experience: 12,
    specialization: ["hair"],
    image: m1,
    bio: {
      ru: "Мастер авторских стрижек и сложного окрашивания. Обучалась в Париже и Милане.",
      uz: "Mualliflik soch olish va murakkab bo'yash ustasi. Parij va Milanda o'qigan.",
    },
  },
  {
    id: "master-2",
    name: { ru: "Алиса Рахимова", uz: "Alisa Rahimova" },
    role: { ru: "Мастер маникюра", uz: "Manikyur ustasi" },
    experience: 8,
    specialization: ["manicure", "pedicure"],
    image: m2,
    bio: {
      ru: "Специализируется на художественном дизайне и долговременном покрытии.",
      uz: "Badiiy dizayn va uzoq muddatli qoplamaga ixtisoslashgan.",
    },
  },
  {
    id: "master-3",
    name: { ru: "Диана Султанова", uz: "Diana Sultonova" },
    role: { ru: "Косметолог-эстетист", uz: "Kosmetolog-estetist" },
    experience: 10,
    specialization: ["other", "massage"],
    image: m3,
    bio: {
      ru: "Эксперт по уходу за лицом, антивозрастным программам и SPA-ритуалам.",
      uz: "Yuz parvarishi, antiqarilik dasturlari va SPA-ritual bo'yicha mutaxassis.",
    },
  },
  {
    id: "master-4",
    name: { ru: "Лола Исмоилова", uz: "Lola Ismoilova" },
    role: { ru: "Массажист", uz: "Massajchi" },
    experience: 7,
    specialization: ["massage"],
    image: m4,
    bio: {
      ru: "Сертифицированный специалист по оздоровительным и релакс-техникам.",
      uz: "Sog'lomlashtirish va relaks texnikalari bo'yicha sertifikatlangan mutaxassis.",
    },
  },
];

// Demo availability generator — deterministic busy slots per master/date
const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function getAvailabilityForDate(masterId: string, dateISO: string) {
  // ~40% busy, deterministic
  const seed = hashStr(masterId + dateISO);
  return TIME_SLOTS.map((time, idx) => {
    const rnd = (hashStr(seed + "|" + idx) % 10);
    return { time, busy: rnd < 4 };
  });
}

export const TIME_SLOTS_LIST = TIME_SLOTS;
