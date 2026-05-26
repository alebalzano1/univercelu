// Datos semilla iniciales para UNIVERCE CELU
const initialProducts = [
  // FUNDAS
  {
    id: "silicon-case",
    name: "Silicon Case",
    category: "fundas",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Funda de silicona líquida de alta calidad, suave al tacto con felpa interna protectora anti-rayaduras.",
    badge: null,
    available: true,
    featured: false
  },
  {
    id: "funda-transparente",
    name: "Funda Transparente",
    category: "fundas",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Funda de TPU flexible totalmente transparente con esquinas reforzadas para amortiguación avanzada.",
    badge: null,
    available: true,
    featured: false
  },
  {
    id: "funda-transparente-magsafe",
    name: "Funda Transparente MagSafe",
    category: "fundas",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Funda ultra-protectora transparente con anillo magnético integrado compatible con carga rápida MagSafe.",
    badge: null,
    available: true,
    featured: false
  },
  {
    id: "funda-silicon-soporte",
    name: "Funda Silicon con Soporte",
    category: "fundas",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Funda de silicona resistente equipada con anillo trasero de metal plegable para soporte cómodo y seguro.",
    badge: null,
    available: true,
    featured: false
  },
  {
    id: "funda-silicon-comun",
    name: "Funda Silicon Común",
    category: "fundas",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Funda clásica de silicona flexible con ajuste perfecto, bordes elevados y textura antideslizante.",
    badge: null,
    available: true,
    featured: false
  },
  {
    id: "funda-rigida-reforzada",
    name: "Funda Rígida Reforzada",
    category: "fundas",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Funda híbrida de alta resistencia con doble capa de protección contra impactos extremos y caídas duras.",
    badge: null,
    available: true,
    featured: false
  },

  // CABLES
  {
    id: "cable-usb-c-samsung",
    name: "Cable USB tipo C Samsung",
    category: "cables",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Cable de carga rápida original Samsung con conectores USB-C en ambos extremos para alta durabilidad.",
    badge: null,
    available: true,
    featured: false
  },
  {
    id: "cable-usb-c-motorola",
    name: "Cable USB tipo C Motorola",
    category: "cables",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Cable original Motorola TurboPower tipo C de gran rendimiento y velocidad estable de transferencia.",
    badge: null,
    available: true,
    featured: false
  },
  {
    id: "cable-usb-c-oferta",
    name: "Cable USB tipo C Oferta",
    category: "cables",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Cable de carga tipo C universal reforzado de 1 metro de longitud a un precio de oferta imperdible.",
    badge: "Oferta",
    available: true,
    featured: true
  },
  {
    id: "cable-micro-usb-oferta",
    name: "Cable Micro USB Oferta",
    category: "cables",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Cable micro USB universal reforzado de gran rendimiento en oferta especial para modelos clásicos.",
    badge: "Oferta",
    available: true,
    featured: true
  },
  {
    id: "cable-iphone-lightning",
    name: "Cable iPhone Lightning",
    category: "cables",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Cable de carga y datos reforzado con conector Lightning compatible con iPhone, iPad y iPod.",
    badge: null,
    available: true,
    featured: false
  },
  {
    id: "cable-c-lightning",
    name: "Cable C a Lightning",
    category: "cables",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Cable de carga rápida con conexión USB-C a conector Lightning de Apple, compatible con protocolo Power Delivery.",
    badge: null,
    available: true,
    featured: false
  },
  {
    id: "cable-usb-lightning",
    name: "Cable USB a Lightning",
    category: "cables",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Cable clásico de carga y sincronización con conexión USB-A a conector Lightning reforzado.",
    badge: null,
    available: true,
    featured: false
  },
  {
    id: "cable-c-c",
    name: "Cable C a C",
    category: "cables",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Cable USB Tipo-C a Tipo-C de alta velocidad para carga ultra-rápida y transmisión de datos masiva.",
    badge: null,
    available: true,
    featured: false
  },
  {
    id: "cable-auxiliar",
    name: "Cable Auxiliar",
    category: "cables",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Cable de audio Jack de 3.5mm a 3.5mm con conectores dorados reforzados y cable trenzado anti-enredos.",
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
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Cabezal de pared original Samsung de 45W Super Fast Charging 2.0 equipado con puerto USB-C.",
    badge: "45W",
    available: true,
    featured: true
  },
  {
    id: "cabezal-iphone-20w",
    name: "Cabezal iPhone 20W",
    category: "cargadores",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Adaptador de pared original USB-C de 20W para carga rápida de modelos Apple iPhone y iPad.",
    badge: "20W",
    available: true,
    featured: true
  },
  {
    id: "cargador-samsung-completo",
    name: "Cargador Samsung Completo",
    category: "cargadores",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Kit completo de pared Samsung que incluye adaptador de corriente rápido y cable Tipo C reforzado.",
    badge: null,
    available: true,
    featured: false
  },
  {
    id: "cargador-motorola-completo",
    name: "Cargador Motorola Completo",
    category: "cargadores",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Kit completo original Motorola TurboPower de gran rendimiento con adaptador de pared y cable Tipo C.",
    badge: null,
    available: true,
    featured: false
  },
  {
    id: "cargador-puxida-25w",
    name: "Cargador Puxida 25W",
    category: "cargadores",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Cargador rápido de pared marca Puxida de 25W con conector USB-C compatible con múltiples marcas.",
    badge: null,
    available: true,
    featured: false
  },

  // AUDIO
  {
    id: "auriculares-inalambricos",
    name: "Auriculares Inalámbricos",
    category: "audio",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Auriculares inalámbricos TWS Bluetooth de alta fidelidad con estuche de carga inteligente y control táctil.",
    badge: null,
    available: true,
    featured: false
  },
  {
    id: "auriculares-cable",
    name: "Auriculares con Cable",
    category: "audio",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Auriculares manos libres clásicos con conector Jack de 3.5mm con sonido estéreo y micrófono incorporado.",
    badge: null,
    available: true,
    featured: false
  },
  {
    id: "parlante",
    name: "Parlante",
    category: "audio",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Parlante portátil Bluetooth de gran alcance, sonido envolvente premium con graves reforzados.",
    badge: null,
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
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Vidrio templado protector 9D de dureza 9H con cobertura total del dispositivo y bordes curvos reforzados.",
    badge: "9D",
    available: true,
    featured: true
  },
  {
    id: "vidrio-anti-espia",
    name: "Vidrio Anti Espía",
    category: "vidrios",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Vidrio templado con tecnología de privacidad que oscurece la pantalla ante miradas laterales sospechosas.",
    badge: null,
    available: true,
    featured: false
  },
  {
    id: "hidrogel",
    name: "Hidrógel",
    category: "vidrios",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Protector de pantalla flexible de hidrogel premium con autoreparación de micro-rayaduras cotidianas.",
    badge: null,
    available: true,
    featured: false
  },

  // SERVICIO TÉCNICO
  {
    id: "servicio-tecnico",
    name: "Servicio Técnico Todas las Marcas",
    category: "servicio",
    price: 0,
    originalPrice: null,
    image: "https://via.placeholder.com/400x400/2D1B69/FFFFFF?text=Univercelu",
    description: "Reparamos todas las marcas. Presupuesto sin cargo en el momento, reparaciones en el día.",
    badge: "Soporte Técnico",
    available: true,
    featured: true
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
