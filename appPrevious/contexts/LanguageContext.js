"use client";
import { createContext, useContext, useState, useEffect } from "react";

// Translation dictionary
const translations = {
  fa: {
    // Navigation
    home: "خانه",
    articles: "مقالات",
    products: "فروشگاه",
    dashboard: "داشبورد",
    login: "ورود هنرجو",
    register: "ثبت‌نام",
    adminLogin: "ورود مدیر",
    logout: "خروج",
    hello: "سلام",

    // Hero Section
    heroTitle: "آموزش شنا حرفه‌ای",
    heroSubtitle: "با پارس شنا",
    heroCta: "ثبت‌ نام در کلاس شنا",

    // Products
    shopTitle: "فروشگاه تجهیزات شنا",
    shopSubtitle: "بهترین کیفیت با قیمت مناسب",
    swimwear: "مایو شنا",
    goggles: "عینک",
    fins: "فین شنا",
    equipment: "تجهیزات",
    addToCart: "افزودن به سبد",
    outOfStock: "ناموجود",
    inStock: "موجود",
    viewAllProducts: "مشاهده همه محصولات",
    specialProducts: "محصولات ویژه",
    price: "قیمت",
    toman: "تومان",
    allProducts: " همه تجهیزات شنا در یک مکان",
    noProductFound: " محصولی یافت نشد",
    noAvailibleProduct: " هیچ محصولی در حال حاضر موجود نیست.",
    callSupport: "   لطفاً بعداً دوباره بررسی کنید یا با پشتیبانی تماس بگیرید.",

    // Classes
    classRegistration: "ثبت‌نام کلاس‌های شنا",
    selectClass: "انتخاب کلاس مناسب برای هر سن و سطح",
    duration: "دقیقه",
    availableSpots: "جای خالی از",
    registerFree: "ثبت‌نام رایگان",
    loginAndRegister: "ورود و ثبت‌نام",
    selectAndRegister: "انتخاب و ثبت‌نام",
    classFull: "کلاس پر است",
    freeClass: "رایگان",
    freeTrialSession: "جلسه آزمایشی",

    // Coach Resume
    coachResume: "رزومه مربی",
    experience15Years: "با ۱۵ سال تجربه در آموزش شنا و کسب مدارک بین‌المللی",
    workExperience: "سابقه کاری",
    certificates: "گواهینامه‌ها",
    achievements: "افتخارات",

    // Auth Pages
    userLogin: "ورود کاربر",
    loginToAccount: "به حساب خود وارد شوید",
    username: "نام کاربری",
    password: "رمز عبور",
    email: "ایمیل",
    phone: "شماره تماس",
    age: "سن",
    createAccount: "ثبت‌نام حساب کاربری",
    newUser: "کاربر جدید هستید؟",
    alreadyHaveAccount: "قبلاً حساب دارید؟",
    loginButton: "ورود",
    registerButton: "ثبت‌نام",
    registerFirst: "ابتدا ثبت نام کنید",

    // Cart
    cart: "سبد خرید",
    cartEmpty: "سبد خرید شما خالی است",
    backToShop: "بازگشت به فروشگاه",
    total: "مجموع",
    clearCart: "پاک کردن سبد",
    payment: "پرداخت",
    loginAndPay: "ورود و پرداخت",
    paymentMethod: "روش پرداخت",
    onlinePayment: "پرداخت آنلاین (زرین‌پال)",
    accountBalance: "پرداخت از موجودی حساب",

    // Dashboard
    welcome: "سلام",
    welcomeToDashboard: "به داشبورد شخصی خود خوش آمدید",
    userInfo: "اطلاعات کاربری",
    name: "نام",
    balance: "موجودی",
    skillLevel: "سطح مهارت",
    chargeAccount: "شارژ حساب",
    amount: "مبلغ به تومان",
    pay: "پرداخت",
    cancel: "انصراف",
    logoutAccount: "خروج از حساب",

    // Admin
    adminPanel: "پنل مدیریت",
    adminLogout: "خروج مدیر",
    manageClasses: "مدیریت کلاس‌ها",
    manageProducts: "مدیریت محصولات",
    createNew: "ایجاد جدید",
    edit: "ویرایش",
    delete: "حذف",
    title: "عنوان",
    classType: "نوع کلاس",
    date: "تاریخ",
    time: "زمان",
    operations: "عملیات",
    category: "دسته‌بندی",
    status: "وضعیت",
    description: "توضیحات",
    maxStudents: "حداکثر دانشجو",
    instructor: "مربی",
    uploadImage: "آپلود تصویر",
    update: "به‌روزرسانی",
    create: "ایجاد",

    // Footer
    swimCoach: "دو مربی حرفه ای شنا",

    // Articles Page (Main)
    articlesTitle: "مقالات آموزشی شنا",
    articlesSubtitle: "راهنماها و نکات تخصصی برای یادگیری انواع مختلف شنا",
    fourMainTypes: "چهار نوع اصلی شنا",
    clickToViewArticles: "کلیک برای مشاهده مقالات",

    // Swimming Types
    freestyle: "کرال سینه",
    backstroke: "کرال پشت",
    butterfly: "پروانه",
    breaststroke: "قورباغه",
    freestyleDesc: "سریع‌ترین و محبوب‌ترین شیوه شنا",
    backstrokeDesc: "شنای روی پشت با حرکات ریتمیک",
    butterflyDesc: "پیچیده‌ترین و قدرتمندترین تکنیک",
    breaststrokeDesc: "آرام‌ترین و مناسب‌ترین برای مبتدیان",

    // Common
    loading: "در حال بارگذاری",
    error: "خطا",
    tryAgain: "تلاش مجدد",
    noDataFound: "اطلاعاتی یافت نشد",
    authRequired: "نیاز به احراز هویت",
    accessDenied: "دسترسی ممنوع",
  },

  en: {
    // Navigation
    home: "Home",
    articles: "Articles",
    products: "Shop",
    dashboard: "Dashboard",
    login: "Student Login",
    register: "Register",
    adminLogin: "Admin Login",
    logout: "Logout",
    hello: "Hello",

    // Hero Section
    heroTitle: "Professional Swimming Training",
    heroSubtitle: "with Pars Swim",
    heroCta: "Register for Swimming Class",

    // Products
    shopTitle: "Swimming Equipment Shop",
    shopSubtitle: "Best Quality at Fair Prices",
    swimwear: "Swimwear",
    goggles: "Goggles",
    fins: "Swim Fins",
    equipment: "Equipment",
    addToCart: "Add to Cart",
    outOfStock: "Out of Stock",
    inStock: "In Stock",
    viewAllProducts: "View All Products",
    specialProducts: "Featured Products",
    price: "Price",
    toman: "Toman",
    allProducts: "All Products In One Place",
    noProductFound: "No Product Was Found",
    noAvailibleProduct: "There Is No Availible Product At The Moment",
    callSupport: "Please Try Again Later Or Call Support",

    // Classes
    classRegistration: "Swimming Class Registration",
    selectClass: "Select the right class for any age and level",
    duration: "minutes",
    availableSpots: "spots available of",
    registerFree: "Free Registration",
    loginAndRegister: "Login & Register",
    selectAndRegister: "Select & Register",
    classFull: "Class Full",
    freeClass: "Free",
    freeTrialSession: "Free Trial Session",

    // Coach Resume
    coachResume: "Coach Resume",
    experience15Years:
      "With 15 years of experience in swimming instruction and international certifications",
    workExperience: "Work Experience",
    certificates: "Certificates",
    achievements: "Achievements",

    // Auth Pages
    userLogin: "User Login",
    loginToAccount: "Login to your account",
    username: "Username",
    password: "Password",
    email: "Email",
    phone: "Phone Number",
    age: "Age",
    createAccount: "Create Account",
    newUser: "New user?",
    alreadyHaveAccount: "Already have an account?",
    loginButton: "Login",
    registerButton: "Register",
    registerFirst: "Register First",

    // Cart
    cart: "Shopping Cart",
    cartEmpty: "Your cart is empty",
    backToShop: "Back to Shop",
    total: "Total",
    clearCart: "Clear Cart",
    payment: "Payment",
    loginAndPay: "Login & Pay",
    paymentMethod: "Payment Method",
    onlinePayment: "Online Payment (ZarinPal)",
    accountBalance: "Pay from Account Balance",

    // Dashboard
    welcome: "Hello",
    welcomeToDashboard: "Welcome to your personal dashboard",
    userInfo: "User Information",
    name: "Name",
    balance: "Balance",
    skillLevel: "Skill Level",
    chargeAccount: "Charge Account",
    amount: "Amount in Toman",
    pay: "Pay",
    cancel: "Cancel",
    logoutAccount: "Logout",

    // Admin
    adminPanel: "Admin Panel",
    adminLogout: "Admin Logout",
    manageClasses: "Manage Classes",
    manageProducts: "Manage Products",
    createNew: "Create New",
    edit: "Edit",
    delete: "Delete",
    title: "Title",
    classType: "Class Type",
    date: "Date",
    time: "Time",
    operations: "Operations",
    category: "Category",
    status: "Status",
    description: "Description",
    maxStudents: "Max Students",
    instructor: "Instructor",
    uploadImage: "Upload Image",
    update: "Update",
    create: "Create",

    // Footer
    swimCoach: "2 Professional Swimming Coaches",

    // Articles Page (Main)
    articlesTitle: "Swimming Training Articles",
    articlesSubtitle:
      "Guides and expert tips for learning different swimming styles",
    fourMainTypes: "Four Main Swimming Styles",
    clickToViewArticles: "Click to view articles",

    // Swimming Types
    freestyle: "Freestyle",
    backstroke: "Backstroke",
    butterfly: "Butterfly",
    breaststroke: "Breaststroke",
    freestyleDesc: "The fastest and most popular swimming style",
    backstrokeDesc: "Swimming on your back with rhythmic movements",
    butterflyDesc: "The most complex and powerful technique",
    breaststrokeDesc: "The calmest and most suitable for beginners",

    // Common
    loading: "Loading",
    error: "Error",
    tryAgain: "Try Again",
    noDataFound: "No data found",
    authRequired: "Authentication Required",
    accessDenied: "Access Denied",
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("fa");

  // Load saved language on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("language") || "fa";
    setLanguage(savedLang);
    document.documentElement.dir = savedLang === "fa" ? "rtl" : "ltr";
    document.documentElement.lang = savedLang;
  }, []);

  // Toggle language
  const toggleLanguage = () => {
    const newLang = language === "fa" ? "en" : "fa";
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
    document.documentElement.dir = newLang === "fa" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  // Get translation
  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
