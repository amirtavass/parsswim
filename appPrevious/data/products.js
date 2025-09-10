export const allProducts = {
  swimwear: [
    {
      id: 1,
      name: "مایو حرفه‌ای نایک",
      price: "450,000",
      image: "/images/swimwear/swimwear-1.jpg",
      inStock: true,
    },
    {
      id: 2,
      name: "مایو اسپیدو ضد کلر",
      price: "380,000",
      image: "/images/swimwear/swimwear-2.jpg",
      inStock: true,
    },
    {
      id: 3,
      name: "مایو آرنا مسابقات",
      price: "520,000",
      image: "/images/swimwear/swimwear-3.jpg",
      inStock: false,
    },
    {
      id: 4,
      name: "مایو کودکان رنگی",
      price: "280,000",
      image: "/images/swimwear/swimwear-4.jpg",
      inStock: true,
    },
  ],
  swimgoggles: [
    {
      id: 5,
      name: "عینک شنا اسپیدو",
      price: "180,000",
      image: "/images/swimgoggles/goggles-1.jpg",
      inStock: true,
    },
    {
      id: 6,
      name: "عینک آرنا حرفه‌ای",
      price: "220,000",
      image: "/images/swimgoggles/goggles-2.jpg",
      inStock: true,
    },
    {
      id: 7,
      name: "عینک کودکان",
      price: "120,000",
      image: "/images/swimgoggles/goggles-3.jpg",
      inStock: true,
    },
  ],
  swimfins: [
    {
      id: 12,
      name: " فین اسپیدو",
      price: "850,000",
      image: "/images/swimfin/fin-1.jpg",
      inStock: true,
    },
    {
      id: 13,
      name: " فین میسیسیپی",
      price: "450,000",
      image: "/images/swimfin/fin-2.jpg",
      inStock: false,
    },
  ],
  swimequipment: [
    {
      id: 8,
      name: "  کیف شنا نایک",
      price: "85,000",
      image: "/images/equipment/backpack-1.jpg",
      inStock: true,
    },
    {
      id: 9,
      name: "کیف شنا اسپیدو",
      price: "45,000",
      image: "/images/equipment/backpack-2.jpg",
      inStock: true,
    },
    {
      id: 10,
      name: " کلاه شناحرفه ای",
      price: "150,000",
      image: "/images/equipment/cap-1.jpg",
      inStock: true,
    },
    {
      id: 11,
      name: "کلاه شنا اسپیدو",
      price: "85,000",
      image: "/images/equipment/cap-2.jpg",
      inStock: true,
    },
  ],
};

export const getAllProducts = () => {
  return Object.values(allProducts).flat();
};
