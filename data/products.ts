export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  /** e.g. "₹4,500". Leave empty to show "Price on request". */
  price?: string;
  /** Path in /public/products/. Falls back to the category image, then a plain panel. */
  img?: string;
  /** Where "View Product" goes. Defaults to the brand's website, else /contact. */
  href?: string;
};

export const CCTV_SEGMENT = [
  "Analog Camera",
  "DVR",
  "IP Camera",
  "NVR",
  "Cables",
  "Switches",
  "Accessories",
  "Monitors",
];

export const IT_SEGMENT = [
  "Biometric attendance",
  "Video Door Phones",
  "Boom Barriers",
  "Interactive Panels",
];

export const CATEGORIES = [...CCTV_SEGMENT, ...IT_SEGMENT];

export const BRANDS = [
  "Hikvision",
  "CP Plus",
  "TP Link",
  "Zebronics",
  "Dahua",
  "Panasonic",
  "Toshiba",
  "Western Digital",
  "D Link",
  "Hi Focus",
  "eSSL",
];

export const BRAND_SITES: Record<string, string> = {
  Hikvision: "https://www.hikvisionindia.com",
  "CP Plus": "https://www.cpplusworld.com",
  "TP Link": "https://www.tp-link.com/in/",
  Zebronics: "https://zebronics.com/collections/cctv",
  Dahua: "https://www.dahuasecurity.com/in",
  Panasonic: "https://security.in.panasonic.com/surveillance-cameras",
  Toshiba: "https://toshiba-india.com/",
  "Western Digital":
    "https://www.westerndigital.com/en-in/products/internal-drives/wd-purple-sata-hdd?sku=WD11PURZ",
  "D Link": "https://www.dlink.com/in/en",
  "Hi Focus": "https://hifocuscctv.com/",
  eSSL: "https://www.esslsecurity.com",
};

// Default picture per category (files in /public/products/).
// Categories without an entry get a plain branded panel until you add an `img`.
export const CATEGORY_IMAGES: Record<string, string> = {
  "Analog Camera": "/products/product-list/hikvision-analog-camera.png",
  "IP Camera": "/products/cctv-cameras.webp",
  DVR: "/products/recorders.jpg",
  NVR: "/products/recorders.jpg",
  "Biometric attendance": "/products/access-control.jpg",
  "Video Door Phones": "/products/access-control.jpg",
  "Boom Barriers": "/products/access-control.jpg",
};

let n = 0;
const make = (
  brand: string,
  category: string,
  name: string,
  extra: Partial<Product> = {}
): Product => ({
  id: `${++n}-${brand}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  brand,
  category,
  name,
  href: BRAND_SITES[brand] ?? "/contact",
  ...extra,
});

/*
 * 12 products, one or more per brand. Put the images in /public/products/product-list/
 * with the same file names (or change the paths below).
 * Add a `price` to any item, e.g. price: "₹4,500".
 */
export const PRODUCTS: Product[] = [
  make("Hikvision", "Analog Camera", "Hikvision Bullet Camera", {
    img: "/products/product-list/hikvision-bullet-camera.png",
  }),
  make("Hikvision", "NVR", "Hikvision 8 Channel NVR", {
    img: "/products/product-list/hikvision-nvr.webp",
  }),
  make("CP Plus", "IP Camera", "CP Plus Dome IP Camera", {
    img: "/products/product-list/cpplus-ip-camera.png",
  }),
  make("Dahua", "DVR", "Dahua 4 Channel DVR", {
    img: "/products/product-list/dahua-dvr.webp",
  }),
  make("TP Link", "Switches", "TP Link PoE Switch", {
    img: "/products/product-list/tplink-switch.jpg",
  }),
  make("Zebronics", "Analog Camera", "Zebronics Analog Camera", {
    img: "/products/product-list/zebronics-camera.webp",
  }),
  make("Panasonic", "IP Camera", "Panasonic IP Camera", {
    img: "/products/product-list/panasonic-camera.png",
  }),
  make("Toshiba", "Accessories", "Toshiba 2 TB Surveillance Hard Disk", {
    img: "/products/product-list/toshiba-hdd.webp",
  }),
  make("Western Digital", "Accessories", "WD Purple 4 TB Hard Disk", {
    img: "/products/product-list/wd-purple.webp",
  }),
  make("D Link", "Switches", "D Link Network Switch", {
    img: "/products/product-list/d-link-switch.webp",
  }),
  make("Hi Focus", "Analog Camera", "Hi Focus Bullet Camera", {
    img: "/products/product-list/hifocus-bullet-camera.webp",
  }),
  make("eSSL", "Biometric attendance", "eSSL Face Recognition", {
    img: "/products/product-list/essl-face-recognition.png",
  }),
];
