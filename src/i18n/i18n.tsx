import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "ru" | "uz";

type Dict = Record<string, string>;
type Translations = Record<Lang, Dict>;

const translations: Translations = {
  ru: {
    "nav.home": "Главная",
    "nav.services": "Услуги",
    "nav.masters": "Мастера",
    "nav.booking": "Запись",
    "nav.contacts": "Контакты",
    "nav.bookNow": "Записаться",

    "hero.tagline": "Салон красоты в Ташкенте",
    "hero.title": "Искусство красоты,\nвдохновлённое вами",
    "hero.subtitle": "Премиальные стрижки, маникюр, педикюр и массаж от лучших мастеров города",
    "hero.cta": "Записаться онлайн",
    "hero.services": "Наши услуги",

    "home.aboutTitle": "О MariSo",
    "home.aboutText": "MariSo — это пространство, где каждая деталь создана для вашего преображения. Мы объединяем мастерство, современные техники и премиальные материалы, чтобы подарить вам безупречный результат и моменты истинного удовольствия.",
    "home.val1Title": "Опытные мастера",
    "home.val1Text": "Сертифицированные специалисты с международной подготовкой",
    "home.val2Title": "Премиальные материалы",
    "home.val2Text": "Работаем только с проверенными брендами профессиональной косметики",
    "home.val3Title": "Безупречная гигиена",
    "home.val3Text": "Стерилизация инструментов и одноразовые расходники на каждой процедуре",

    "home.servicesTitle": "Наши направления",
    "home.servicesSubtitle": "Полный спектр услуг красоты под одной крышей",
    "home.viewAll": "Смотреть все услуги",
    "home.viewAllMasters": "Смотреть всех мастеров",

    "services.title": "Услуги и цены",
    "services.subtitle": "Прозрачные цены, безупречное качество",
    "services.from": "от",
    "services.sum": "сум",
    "services.duration": "мин",
    "services.book": "Записаться",

    "cat.hair": "Стрижки и укладка",
    "cat.manicure": "Маникюр",
    "cat.pedicure": "Педикюр",
    "cat.massage": "Массаж",
    "cat.other": "Уход и SPA",

    "masters.title": "Наши мастера",
    "masters.subtitle": "Команда профессионалов, которым можно доверять",
    "masters.experience": "опыта",
    "masters.specialization": "Специализация",

    "booking.title": "Записаться на приём",
    "booking.subtitle": "Выберите мастера, услугу и удобное время",
    "booking.selectMaster": "Выберите мастера",
    "booking.selectDate": "Выберите дату",
    "booking.selectTime": "Выберите время",
    "booking.available": "Свободно",
    "booking.busy": "Занято",
    "booking.free": "Свободные окна",
    "booking.taken": "Занятые окна",
    "booking.name": "Ваше имя",
    "booking.phone": "Телефон",
    "booking.service": "Услуга",
    "booking.comment": "Комментарий",
    "booking.commentPh": "Пожелания или дополнительная информация",
    "booking.submit": "Отправить заявку",
    "booking.sending": "Отправка...",
    "booking.success": "Заявка отправлена! Мы свяжемся с вами.",
    "booking.error": "Ошибка отправки. Попробуйте позже.",
    "booking.pickAll": "Заполните все поля",
    "booking.pickSlot": "Выберите свободное окно в календаре",
    "booking.calendar": "Календарь доступности",
    "booking.noSlots": "Нет свободных окон — выберите другой день",

    "contacts.title": "Контакты",
    "contacts.subtitle": "Будем рады видеть вас",
    "contacts.address": "Адрес",
    "contacts.addressVal": "г. Ташкент, ул. Амира Темура, 55",
    "contacts.phone": "Телефон",
    "contacts.hours": "Часы работы",
    "contacts.hoursVal": "Ежедневно с 9:00 до 21:00",

    "footer.rights": "Все права защищены",
    "footer.slogan": "Красота, которую вы заслуживаете",

    "months.0": "Январь", "months.1": "Февраль", "months.2": "Март", "months.3": "Апрель",
    "months.4": "Май", "months.5": "Июнь", "months.6": "Июль", "months.7": "Август",
    "months.8": "Сентябрь", "months.9": "Октябрь", "months.10": "Ноябрь", "months.11": "Декабрь",
    "days.mon": "Пн", "days.tue": "Вт", "days.wed": "Ср", "days.thu": "Чт", "days.fri": "Пт", "days.sat": "Сб", "days.sun": "Вс",
  },
  uz: {
    "nav.home": "Bosh sahifa",
    "nav.services": "Xizmatlar",
    "nav.masters": "Ustalar",
    "nav.booking": "Yozilish",
    "nav.contacts": "Kontaktlar",
    "nav.bookNow": "Yozilish",

    "hero.tagline": "Toshkentdagi go'zallik saloni",
    "hero.title": "Siz ilhomlantirgan\ngo'zallik san'ati",
    "hero.subtitle": "Shahardagi eng yaxshi ustalardan premium soch turmaklari, manikyur, pedikyur va massaj",
    "hero.cta": "Onlayn yozilish",
    "hero.services": "Xizmatlarimiz",

    "home.aboutTitle": "MariSo haqida",
    "home.aboutText": "MariSo — har bir detali sizning o'zgarishingiz uchun yaratilgan makon. Biz mukammal natija va haqiqiy zavq daqiqalarini taqdim etish uchun mahorat, zamonaviy texnikalar va premium materiallarni birlashtiramiz.",
    "home.val1Title": "Tajribali ustalar",
    "home.val1Text": "Xalqaro tayyorgarlikdan o'tgan sertifikatlangan mutaxassislar",
    "home.val2Title": "Premium materiallar",
    "home.val2Text": "Faqat ishonchli professional kosmetika brendlari bilan ishlaymiz",
    "home.val3Title": "Mukammal gigiyena",
    "home.val3Text": "Har bir muolajada asboblarni sterilizatsiya va bir martali materiallar",

    "home.servicesTitle": "Yo'nalishlarimiz",
    "home.servicesSubtitle": "Bir tom ostida to'liq go'zallik xizmatlari",
    "home.viewAll": "Barcha xizmatlarni ko'rish",
    "home.viewAllMasters": "Barcha ustalarni ko'rish",

    "services.title": "Xizmatlar va narxlar",
    "services.subtitle": "Shaffof narxlar, mukammal sifat",
    "services.from": "dan",
    "services.sum": "so'm",
    "services.duration": "daq",
    "services.book": "Yozilish",

    "cat.hair": "Soch turmaklari",
    "cat.manicure": "Manikyur",
    "cat.pedicure": "Pedikyur",
    "cat.massage": "Massaj",
    "cat.other": "Parvarish va SPA",

    "masters.title": "Ustalarimiz",
    "masters.subtitle": "Ishonishingiz mumkin bo'lgan professionallar jamoasi",
    "masters.experience": "tajriba",
    "masters.specialization": "Mutaxassislik",

    "booking.title": "Qabulga yozilish",
    "booking.subtitle": "Usta, xizmat va qulay vaqtni tanlang",
    "booking.selectMaster": "Ustani tanlang",
    "booking.selectDate": "Sanani tanlang",
    "booking.selectTime": "Vaqtni tanlang",
    "booking.available": "Bo'sh",
    "booking.busy": "Band",
    "booking.free": "Bo'sh vaqtlar",
    "booking.taken": "Band vaqtlar",
    "booking.name": "Ismingiz",
    "booking.phone": "Telefon",
    "booking.service": "Xizmat",
    "booking.comment": "Izoh",
    "booking.commentPh": "Tilaklar yoki qo'shimcha ma'lumot",
    "booking.submit": "Yuborish",
    "booking.sending": "Yuborilmoqda...",
    "booking.success": "Ariza yuborildi! Biz siz bilan bog'lanamiz.",
    "booking.error": "Xatolik. Keyinroq urinib ko'ring.",
    "booking.pickAll": "Barcha maydonlarni to'ldiring",
    "booking.pickSlot": "Kalendardan bo'sh vaqtni tanlang",
    "booking.calendar": "Bo'sh vaqtlar kalendari",
    "booking.noSlots": "Bo'sh vaqtlar yo'q — boshqa kun tanlang",

    "contacts.title": "Kontaktlar",
    "contacts.subtitle": "Sizni kutib olamiz",
    "contacts.address": "Manzil",
    "contacts.addressVal": "Toshkent sh., Amir Temur ko'chasi, 55",
    "contacts.phone": "Telefon",
    "contacts.hours": "Ish vaqti",
    "contacts.hoursVal": "Har kuni 9:00 dan 21:00 gacha",

    "footer.rights": "Barcha huquqlar himoyalangan",
    "footer.slogan": "Siz munosib bo'lgan go'zallik",

    "months.0": "Yanvar", "months.1": "Fevral", "months.2": "Mart", "months.3": "Aprel",
    "months.4": "May", "months.5": "Iyun", "months.6": "Iyul", "months.7": "Avgust",
    "months.8": "Sentyabr", "months.9": "Oktyabr", "months.10": "Noyabr", "months.11": "Dekabr",
    "days.mon": "Du", "days.tue": "Se", "days.wed": "Ch", "days.thu": "Pa", "days.fri": "Ju", "days.sat": "Sh", "days.sun": "Ya",
  },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nCtx | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("mariso_lang") : null;
    return (stored === "uz" || stored === "ru") ? stored : "ru";
  });

  useEffect(() => {
    localStorage.setItem("mariso_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);
  const t = (key: string) => translations[lang][key] ?? key;

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
