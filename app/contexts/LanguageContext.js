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
    toman: "£",
    allProducts: " همه تجهیزات شنا در یک مکان",
    noProductFound: " محصولی یافت نشد",
    noAvailibleProduct: " هیچ محصولی در حال حاضر موجود نیست.",
    callSupport: "   لطفاً بعداً دوباره بررسی کنید یا با پشتیبانی تماس بگیرید.",
    Total: "مجموع",

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
    back: "بازگشت",
    backToShop: "بازگشت به فروشگاه",
    total: "مجموع",
    clearCart: "پاک کردن سبد",
    payment: "پرداخت",
    loginAndPay: "ورود و پرداخت",
    paymentMethod: "روش پرداخت",
    onlinePayment: "پرداخت آنلاین (زرین‌پال)",
    accountBalance: "پرداخت از موجودی حساب",
    authRequired: "برای پرداخت نیاز به ورود به حساب کاربری دارید",

    // Dashboard
    welcome: "سلام",
    welcomeToDashboard: "به داشبورد شخصی خود خوش آمدید",
    userInfo: "اطلاعات کاربری",
    name: "نام",
    balance: "موجودی",
    skillLevel: "سطح مهارت",
    chargeAccount: "شارژ حساب",
    amount: "مبلغ به پوند",
    pay: "پرداخت",
    cancel: "انصراف",
    logoutAccount: "خروج از حساب",

    // Admin
    adminLogin: "ورود مدیر",
    adminUserName: "نام کاربری مدیر",
    adminPassword: "رمز عبور مدیر",
    adminPanel: "پنل مدیریت",
    adminLogout: "خروج مدیر",

    // Footer
    swimCoach: "دو مربی حرفه ای شنا",
    allRightsReserved: "تمام حقوق محفوظ است",

    // Articles Page (Main)
    articlesTitle: "مقالات آموزشی شنا",
    articlesSubtitle: "راهنماها و نکات تخصصی برای یادگیری انواع مختلف شنا",
    fourMainTypes: "چهار نوع اصلی شنا",
    clickToViewArticles: "کلیک برای مشاهده مقالات",
    readMore: "بیشتر بخوانید",

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
    noAvailibleProduct: "There Is No Available Product At The Moment",
    callSupport: "Please Try Again Later Or Call Support",
    backToShop: "Back to Shop",

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
    back: "Back",
    total: "Total",
    clearCart: "Clear Cart",
    payment: "Payment",
    loginAndPay: "Login & Pay",
    paymentMethod: "Payment Method",
    onlinePayment: "Online Payment (ZarinPal)",
    accountBalance: "Pay from Account Balance",
    Total: "total",
    authRequired: "Authentication required for payment",

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
    adminLogin: "Admin Login",
    adminUserName: "Admin Username",
    adminPassword: "Admin Password",
    adminPanel: "Admin Panel",
    adminLogout: "Admin Logout",

    // Footer
    swimCoach: "2 Professional Swimming Coaches",
    allRightsReserved: "All rights reserved",

    // Articles Page (Main)
    articlesTitle: "Swimming Training Articles",
    articlesSubtitle:
      "Guides and expert tips for learning different swimming styles",
    fourMainTypes: "Four Main Swimming Styles",
    clickToViewArticles: "Click to view articles",
    readMore: "Read More",

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
    accessDenied: "Access Denied",
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en"); // Changed from "fa" to "en"
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved language on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("language") || "en"; // Changed from "fa" to "en"
      setLanguage(savedLang);
      document.documentElement.dir = savedLang === "fa" ? "rtl" : "ltr";
      document.documentElement.lang = savedLang;
    } catch (error) {
      console.error("Error loading language from localStorage:", error);
      // Fallback to default
      setLanguage("en"); // Changed from "fa" to "en"
      document.documentElement.dir = "ltr"; // Changed from "rtl" to "ltr"
      document.documentElement.lang = "en"; // Changed from "fa" to "en"
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Toggle language
  const toggleLanguage = () => {
    const newLang = language === "fa" ? "en" : "fa";
    setLanguage(newLang);
    try {
      localStorage.setItem("language", newLang);
    } catch (error) {
      console.error("Error saving language to localStorage:", error);
    }
    document.documentElement.dir = newLang === "fa" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  // Get translation with fallback
  const t = (key) => {
    if (!key) return "";

    try {
      const translation = translations[language]?.[key];
      if (translation !== undefined) {
        return translation;
      }

      // Fallback to English if Persian translation not found (or vice versa)
      const fallbackLang = language === "en" ? "fa" : "en";
      const fallback = translations[fallbackLang]?.[key];
      if (fallback !== undefined) {
        return fallback;
      }

      // Return the key itself as last resort
      console.warn(`Translation missing for key: ${key}`);
      return key;
    } catch (error) {
      console.error(`Translation error for key: ${key}`, error);
      return key;
    }
  };

  // Don't render children until language is loaded
  if (!isLoaded) {
    return null;
  }

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
