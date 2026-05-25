// Datos semilla iniciales para UNIVERCE CELU
const initialProducts = [
  // FUNDAS
  {
    id: "silicon-case",
    name: "Silicon case",
    category: "fundas",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673394/pyfo8bnllfp0x9aauyun.jpg",
    description: "Funda de silicona suave al tacto con microfibra interna protectora para proteger tu celular contra caídas.",
    badge: "Más Vendido",
    available: true,
    featured: true
  },
  {
    id: "funda-transparente",
    name: "Funda transparente",
    category: "fundas",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673395/e5dsco3oo1ppzlgpw2bc.jpg",
    description: "Funda transparente antigolpes con esquinas reforzadas para amortiguación avanzada.",
    badge: null,
    available: true,
    featured: true
  },
  {
    id: "funda-transparente-magsafe",
    name: "Funda transparente MagSafe",
    category: "fundas",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673396/vqx8t739vfho8yygj1gi.jpg",
    description: "Funda protectora con anillo de imanes MagSafe integrado para carga inalámbrica ultra-veloz.",
    badge: "MagSafe",
    available: true,
    featured: true
  },
  {
    id: "funda-silicon-case-soporte",
    name: "Funda Silicon case con soporte",
    category: "fundas",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673398/fdmlomkktcig4v5qqejg.jpg",
    description: "Funda de silicona líquida equipada con anillo trasero de metal plegable para sostener tu celular cómodamente.",
    badge: null,
    available: true,
    featured: false
  },
  {
    id: "funda-silicon-comun",
    name: "Funda Silicon común",
    category: "fundas",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673426/nnjahrfhlqu1mnl2tcxx.jpg",
    description: "Funda clásica de silicona flexible con ajuste perfecto y bordes elevados.",
    badge: null,
    available: true,
    featured: false
  },
  {
    id: "funda-rigida-reforzada",
    name: "Funda rígida reforzada",
    category: "fundas",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673399/lkayfatx9le9h7nechbn.jpg",
    description: "Funda híbrida de alta resistencia con doble capa protectora contra impactos severos.",
    badge: "Extra Shield",
    available: true,
    featured: false
  },
  // CABLES
  {
    id: "cable-usb-tipo-c-samsung",
    name: "Cable USB tipo C Samsung",
    category: "cables",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673405/s9wcvkapqjv2hbd2llkd.jpg",
    description: "Cable de carga rápida original Samsung (Tipo C a Tipo C) compatible con alta tensión.",
    badge: null,
    available: true,
    featured: false
  },
  {
    id: "cable-usb-tipo-c-motorola",
    name: "Cable USB tipo C Motorola",
    category: "cables",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673406/ymgwxols0rsvh1jazayi.jpg",
    description: "Cable original Motorola TurboPower de gran rendimiento y velocidad.",
    badge: null,
    available: true,
    featured: false
  },
  {
    id: "cable-usb-tipo-c-oferta",
    name: "Cable USB tipo C oferta",
    category: "cables",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673408/qxnqbwgmcioorpyqwntr.jpg",
    description: "Cable de carga rápida universal con conector tipo C de 1 metro en oferta especial.",
    badge: "Promo",
    available: true,
    featured: false
  },
  {
    id: "cable-micro-usb-oferta",
    name: "Cable Micro USB oferta",
    category: "cables",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673409/ijoh8caewf02mm5dbihh.jpg",
    description: "Cable de repuesto para modelos anteriores con puerto Micro-USB en súper oferta.",
    badge: "Promo",
    available: true,
    featured: false
  },
  {
    id: "cable-iphone",
    name: "Cable iPhone (Lightning)",
    category: "cables",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673464/wj2r6rx8slpenzufpa59.jpg",
    description: "Cable de carga y datos con conector Lightning para iPhone y iPad con conectores reforzados.",
    badge: null,
    available: true,
    featured: false
  },
  {
    id: "cable-c-a-lightning",
    name: "Cable C a Lightning",
    category: "cables",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673411/wg3c518mkouyhycnyjhs.jpg",
    description: "Cable Tipo C a Lightning para carga rápida PD de iPhone y transferencia veloz.",
    badge: "Carga Rápida",
    available: true,
    featured: false
  },
  {
    id: "cable-usb-a-lightning",
    name: "Cable USB a Lightning",
    category: "cables",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673464/wj2r6rx8slpenzufpa59.jpg",
    description: "Cable tradicional USB-A a conector Lightning de alta resistencia.",
    badge: null,
    available: true,
    featured: false
  },
  {
    id: "cable-c-a-c",
    name: "Cable C a C",
    category: "cables",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673405/s9wcvkapqjv2hbd2llkd.jpg",
    description: "Cable de carga rápida con conectores Tipo C en ambos extremos compatible con múltiples dispositivos.",
    badge: null,
    available: true,
    featured: false
  },
  {
    id: "cable-auxiliar",
    name: "Cable auxiliar",
    category: "cables",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673404/s95hemc79bbw2rvea8ad.jpg",
    description: "Cable de audio auxiliar Jack 3.5mm compatible con equipos de sonido y autoestereos.",
    badge: null,
    available: true,
    featured: false
  },
  // CARGADORES
  {
    id: "cabezal-samsung-45w",
    name: "Cabezal Samsung 45W",
    category: "cargadores",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673412/kjv4n2i286wshrlz2rly.jpg",
    description: "Adaptador de pared original Samsung con puerto USB-C de 45W súper rápida 2.0.",
    badge: "Super Fast 2.0",
    available: true,
    featured: true
  },
  {
    id: "cabezal-iphone-20w",
    name: "Cabezal iPhone 20W",
    category: "cargadores",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673413/xj17zt67wpoveruywujn.jpg",
    description: "Adaptador de corriente USB-C original de 20W Apple para una carga ultra rápida de tu iPhone.",
    badge: "PD 20W",
    available: true,
    featured: true
  },
  {
    id: "cargador-samsung-completo",
    name: "Cargador Samsung completo",
    category: "cargadores",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673414/bdutha53t67pikouxpkl.jpg",
    description: "Kit completo que incluye cabezal de carga de 25W y cable original Samsung USB Tipo C a C.",
    badge: "Kit Completo",
    available: true,
    featured: false
  },
  {
    id: "cargador-motorola-completo",
    name: "Cargador Motorola completo",
    category: "cargadores",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673416/scok8pssi8oqrmfammpo.jpg",
    description: "Kit completo de pared equipado con la tecnología Motorola TurboPower y cable USB Tipo C desmontable.",
    badge: "TurboPower",
    available: true,
    featured: false
  },
  {
    id: "cargador-puxida-25w",
    name: "Cargador Puxida 25W",
    category: "cargadores",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673417/p1pk4osq35g5lil5hspu.jpg",
    description: "Cargador rápido de pared inteligente de 25W con puerto USB-C compatible con todas las marcas principales.",
    badge: null,
    available: true,
    featured: false
  },
  // AUDIO
  {
    id: "auriculares-inalambricos",
    name: "Auriculares inalámbricos",
    category: "audio",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673402/fsiljh9u7tmm9ymeuyie.jpg",
    description: "Auriculares inalámbricos TWS con estuche de carga inteligente y sonido estéreo envolvente HD.",
    badge: "Bluetooth",
    available: true,
    featured: true
  },
  {
    id: "auriculares-con-cable",
    name: "Auriculares con cable",
    category: "audio",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673404/s95hemc79bbw2rvea8ad.jpg",
    description: "Auriculares in-ear ergonómicos de cable reforzado con control de volumen y manos libres.",
    badge: null,
    available: true,
    featured: false
  },
  {
    id: "parlantes",
    name: "Parlantes",
    category: "audio",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673418/ay8gd0uo7wtdcmqfq2f8.jpg",
    description: "Parlante inalámbrico Bluetooth resistente a salpicaduras con sonido nítido y graves potentes.",
    badge: "Waterproof",
    available: true,
    featured: false
  },
  // VIDRIOS
  {
    id: "vidrio-9d",
    name: "Vidrio 9D",
    category: "vidrios",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673420/pj6rzcv7n8ebaeqivapp.jpg",
    description: "Protector de pantalla premium de vidrio templado 9D con dureza 9H y bordes curvos para cobertura total.",
    badge: "Favorito",
    available: true,
    featured: true
  },
  {
    id: "vidrio-anti-espia",
    name: "Vidrio anti espía",
    category: "vidrios",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673421/dbxs0tggmjdv3nq8qzmo.jpg",
    description: "Vidrio protector inteligente anti-espía. Evita que otros vean tu pantalla desde los costados.",
    badge: "Privacidad",
    available: true,
    featured: false
  },
  {
    id: "hidrogel",
    name: "Hidrógel",
    category: "vidrios",
    price: 0,
    originalPrice: null,
    image: "https://res.cloudinary.com/dgb5o9y0v/image/upload/v1779673422/qdifryhqothw8qcqw33b.jpg",
    description: "Film de hidrógel auto-reparable de alta tecnología. Absorbe impactos de forma inteligente sin quebrarse.",
    badge: "Flex Shield",
    available: true,
    featured: false
  }
];

const initialConfig = {
  storeName: "Univercelu",
  tagline: "Más de 10 años en el rubro.",
  whatsapp: "5491136719257",
  instagram: "univercelu_merlo",
  deliveryZone: "Maipú 510, Merlo Centro (entre Libertador y Saranfi)",
  minOrder: 0,
  welcomeMessage: "¡Hola! Quisiera hacer un pedido de accesorios 📱"
};

window.initialProducts = initialProducts;
window.initialConfig   = initialConfig;
