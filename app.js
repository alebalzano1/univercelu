/* ==========================================================================
   Base de Datos de Productos (Extraídos del Instagram @univercelu_merlo)
   ========================================================================== */
const PRODUCTOS = [
  {
    id: "apple-charger-20w",
    name: "Cargador Rápido 20W Apple",
    category: "cargadores",
    price: 28000,
    originalPrice: 35000,
    image: "assets/cargador.png",
    description: "Adaptador de corriente USB-C de 20W original Apple. Carga súper rápida y segura para tu iPhone.",
    badge: "10% OFF"
  },
  {
    id: "airpods-pro-anc",
    name: "AirPods Pro (100% ANC)",
    category: "apple",
    price: 95000,
    originalPrice: 120000,
    image: "assets/airpods.png",
    description: "Cancelación activa de ruido premium con modo de transparencia ambiental y un sonido galáctico e inmersivo.",
    badge: "Destacado"
  },
  {
    id: "jbl-tune-500bt",
    name: "JBL Tune 500BT Wireless",
    category: "auriculares",
    price: 58000,
    originalPrice: 65000,
    image: "assets/jbl.png",
    description: "Sonido JBL Pure Bass emblemático, conectividad inalámbrica bluetooth y hasta 27 horas de autonomía.",
    badge: "Más Vendido"
  },
  {
    id: "apple-cable-lightning",
    name: "Cable Apple USB-C a Lightning",
    category: "cargadores",
    price: 18000,
    originalPrice: 22000,
    image: "assets/cargador.png",
    description: "Cable de carga y sincronización rápida original de 1 metro. Conector tipo C a Lightning reforzado.",
    badge: null
  },
  {
    id: "jbl-tune-760nc",
    name: "JBL Tune 760NC (Cancelación Ruido)",
    category: "auriculares",
    price: 85000,
    originalPrice: 98000,
    image: "assets/jbl.png",
    description: "Cancelación activa de ruido avanzada de JBL, graves brutales y 35 horas de batería con carga ultrarrápida.",
    badge: "Premium"
  },
  {
    id: "earpods-lightning",
    name: "EarPods Apple Conector Lightning",
    category: "apple",
    price: 22000,
    originalPrice: 26000,
    image: "assets/airpods.png",
    description: "Auriculares con cable originales con conector Lightning. Ajuste ergonómico premium y control de audio integrado.",
    badge: null
  }
];

// Configuración general
const WHATSAPP_NUMBER = "5491123456789"; // Número de WhatsApp de pruebas de Univercelu (editable)

/* ==========================================================================
   Variables de Estado y Elementos del DOM
   ========================================================================== */
let carrito = JSON.parse(localStorage.getItem('univercelu_cart')) || [];

// Elementos DOM del Catálogo
const productsGrid = document.getElementById('products-catalog-grid');
const filterButtons = document.querySelectorAll('.filter-btn');

// Elementos DOM del Carrito
const cartOverlay = document.getElementById('shopping-cart-overlay');
const cartModal = document.getElementById('shopping-cart-modal');
const openCartBtn = document.getElementById('open-cart-btn');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartCounter = document.getElementById('cart-counter');
const cartItemsBody = document.getElementById('cart-items-body');
const cartSummaryQty = document.getElementById('cart-summary-qty');
const cartSummaryTotal = document.getElementById('cart-summary-total');
const checkoutWspBtn = document.getElementById('checkout-whatsapp-btn');

// Elementos DOM del Detalle de Producto
const productDetailOverlay = document.getElementById('product-detail-overlay');
const productDetailModal = document.getElementById('product-detail-modal');
const closeDetailBtn = document.getElementById('close-detail-btn');
const productDetailContent = document.getElementById('product-detail-content');

// Navegación Móvil
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const navbarLinks = document.getElementById('navbar-links');

/* ==========================================================================
   Inicialización y Renderizado
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  renderCatalog('todos');
  updateCartUI();
  setupEventListeners();
});

// Renderizar catálogo filtrado
function renderCatalog(categoryFilter) {
  productsGrid.innerHTML = '';
  
  const productosFiltrados = categoryFilter === 'todos' 
    ? PRODUCTOS 
    : PRODUCTOS.filter(p => p.category === categoryFilter);

  productosFiltrados.forEach((prod, index) => {
    const card = document.createElement('div');
    card.className = 'product-card glass-card';
    card.id = `prod-${prod.id}`;
    card.style.cursor = 'pointer';
    // Retraso de animación para efecto cascada
    card.style.animation = `fadeSlideIn 0.5s ease-out ${index * 0.08}s both`;

    const badgeHTML = prod.badge 
      ? `<div class="product-badge">${prod.badge}</div>` 
      : '';

    const originalPriceHTML = prod.originalPrice 
      ? `<span>$${prod.originalPrice.toLocaleString('es-AR')}</span>` 
      : '';

    card.innerHTML = `
      ${badgeHTML}
      <div class="product-image-container">
        <img src="${prod.image}" alt="${prod.name}" loading="lazy">
      </div>
      <div class="product-details">
        <span class="product-category">${prod.category}</span>
        <h3 class="product-name">${prod.name}</h3>
        <p class="product-desc">${prod.description}</p>
        <div class="product-footer">
          <div class="product-price">
            ${originalPriceHTML}
            $${prod.price.toLocaleString('es-AR')}
          </div>
          <button class="add-to-cart-btn" data-id="${prod.id}" title="Añadir al carrito">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
    `;

    // Evento de clic en toda la tarjeta para abrir el detalle al estilo Mercado Libre
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.add-to-cart-btn')) {
        openProductDetail(prod.id);
      }
    });

    productsGrid.appendChild(card);
  });

  // Agregar eventos a los botones de añadir recién creados
  const addButtons = productsGrid.querySelectorAll('.add-to-cart-btn');
  addButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-id');
      addToCart(id);
      
      // Animación micro de confirmación en el botón
      btn.style.transform = 'scale(0.85)';
      setTimeout(() => {
        btn.style.transform = '';
      }, 150);
    });
  });
}

// Estilos de animación keyframe temporales añadidos programáticamente
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes fadeSlideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(styleSheet);

/* ==========================================================================
   Lógica del Carrito de Compras
   ========================================================================== */
function addToCart(productId, cantidadToAdd = 1) {
  const prodBase = PRODUCTOS.find(p => p.id === productId);
  if (!prodBase) return;

  const itemExistente = carrito.find(item => item.id === productId);

  if (itemExistente) {
    itemExistente.cantidad += cantidadToAdd;
  } else {
    carrito.push({
      id: prodBase.id,
      name: prodBase.name,
      price: prodBase.price,
      image: prodBase.image,
      cantidad: cantidadToAdd
    });
  }

  saveCart();
  updateCartUI();
  
  // Abrir carrito de forma automática al agregar un producto
  openCart();
}

function updateQty(productId, increment) {
  const item = carrito.find(i => i.id === productId);
  if (!item) return;

  item.cantidad += increment;

  if (item.cantidad <= 0) {
    carrito = carrito.filter(i => i.id !== productId);
  }

  saveCart();
  updateCartUI();
}

function removeFromCart(productId) {
  carrito = carrito.filter(i => i.id !== productId);
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('univercelu_cart', JSON.stringify(carrito));
}

// Renderizar UI del Carrito
function updateCartUI() {
  cartItemsBody.innerHTML = '';
  
  let totalArticulos = 0;
  let totalPrecio = 0;

  if (carrito.length === 0) {
    cartItemsBody.innerHTML = `
      <div class="cart-empty-message">
        <i class="fa-solid fa-satellite-dish"></i>
        <p>Tu carrito está en el espacio exterior... ¡Añade algunos productos para comenzar!</p>
      </div>
    `;
    checkoutWspBtn.style.opacity = '0.5';
    checkoutWspBtn.style.pointerEvents = 'none';
  } else {
    checkoutWspBtn.style.opacity = '1';
    checkoutWspBtn.style.pointerEvents = 'all';

    carrito.forEach(item => {
      totalArticulos += item.cantidad;
      totalPrecio += item.price * item.cantidad;

      const itemRow = document.createElement('div');
      itemRow.className = 'cart-item';
      itemRow.innerHTML = `
        <div class="cart-item-img">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-name">${item.name}</h4>
          <span class="cart-item-price">$${(item.price * item.cantidad).toLocaleString('es-AR')}</span>
          <div class="cart-item-qty">
            <button class="qty-btn dec-btn" data-id="${item.id}">-</button>
            <span class="qty-val">${item.cantidad}</span>
            <button class="qty-btn inc-btn" data-id="${item.id}">+</button>
          </div>
        </div>
        <button class="remove-item-btn" data-id="${item.id}" title="Quitar artículo">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      `;

      cartItemsBody.appendChild(itemRow);
    });

    // Eventos de botones internos del carrito
    cartItemsBody.querySelectorAll('.dec-btn').forEach(btn => {
      btn.addEventListener('click', () => updateQty(btn.getAttribute('data-id'), -1));
    });

    cartItemsBody.querySelectorAll('.inc-btn').forEach(btn => {
      btn.addEventListener('click', () => updateQty(btn.getAttribute('data-id'), 1));
    });

    cartItemsBody.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', () => removeFromCart(btn.getAttribute('data-id')));
    });
  }

  // Actualizar totales y contadores
  cartCounter.textContent = totalArticulos;
  cartSummaryQty.textContent = totalArticulos;
  cartSummaryTotal.textContent = `$${totalPrecio.toLocaleString('es-AR')}`;
}

/* ==========================================================================
   Gestión de Ventanas y Modales (UI)
   ========================================================================== */
function openCart() {
  cartModal.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden'; // Detener scroll
}

function closeCart() {
  cartModal.classList.remove('open');
  cartOverlay.classList.remove('open');
  document.body.style.overflow = ''; // Habilitar scroll
}

/* Lógica determinista de generación de datos simulados estilo Mercado Libre */
function getProductMockData(productId) {
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash += productId.charCodeAt(i);
  }
  
  // Rating determinista entre 4.6 y 4.9
  const rating = (4.6 + (hash % 4) * 0.1).toFixed(1);
  
  // Número de opiniones determinista entre 18 y 85
  const reviews = 18 + (hash % 68);
  
  // Ventas estimadas determinista entre 40 y 380
  const sold = 40 + (hash % 340);
  
  // Stock disponible simulado determinista entre 3 y 7
  const stock = 3 + (hash % 5);
  
  return { rating, reviews, sold, stock };
}

/* Lógica del Modal Detalle de Producto estilo Mercado Libre */
function openProductDetail(productId) {
  const prod = PRODUCTOS.find(p => p.id === productId);
  if (!prod) return;

  const mockData = getProductMockData(productId);
  let selectedQty = 1;

  // Calcular precio original, descuento y cuotas
  const discountPercent = prod.originalPrice 
    ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)
    : 0;

  const originalPriceHTML = prod.originalPrice 
    ? `<span class="detail-original-price">$${prod.originalPrice.toLocaleString('es-AR')}</span>` 
    : '';

  const discountPercentHTML = discountPercent > 0 
    ? `<span class="detail-discount-percent">${discountPercent}% OFF</span>` 
    : '';

  // Calcular cuotas fijas (6 cuotas)
  const installmentPrice = Math.round(prod.price / 6);

  // Características claves basadas en la categoría del producto
  let specsHTML = '';
  if (prod.category === 'apple') {
    specsHTML = `
      <li><i class="fa-solid fa-circle-check"></i> Compatibilidad y rendimiento garantizados por Apple</li>
      <li><i class="fa-solid fa-circle-check"></i> Conector y materiales de calidad certificada</li>
      <li><i class="fa-solid fa-circle-check"></i> Chip inteligente de control de tensión y temperatura</li>
    `;
  } else if (prod.category === 'auriculares') {
    specsHTML = `
      <li><i class="fa-solid fa-circle-check"></i> Sonido envolvente inmersivo de alta definición</li>
      <li><i class="fa-solid fa-circle-check"></i> Cancelación de ruido pasiva y almohadillas ergonómicas</li>
      <li><i class="fa-solid fa-circle-check"></i> Conectividad ultra-rápida y gran autonomía de batería</li>
    `;
  } else if (prod.category === 'cargadores') {
    specsHTML = `
      <li><i class="fa-solid fa-circle-check"></i> Carga rápida inteligente adaptada a tu dispositivo</li>
      <li><i class="fa-solid fa-circle-check"></i> Protección integrada contra cortocircuitos y sobrecargas</li>
      <li><i class="fa-solid fa-circle-check"></i> Diseño compacto y materiales ignífugos de alta durabilidad</li>
    `;
  } else {
    specsHTML = `
      <li><i class="fa-solid fa-circle-check"></i> Calidad premium garantizada directamente por Univercelu</li>
      <li><i class="fa-solid fa-circle-check"></i> Diseño funcional y estéticos acabados espaciales</li>
      <li><i class="fa-solid fa-circle-check"></i> Garantía oficial de 3 meses y servicio de soporte técnico</li>
    `;
  }

  // Estrellas HTML
  let starsHTML = '';
  const fullStars = Math.floor(mockData.rating);
  const hasHalfStar = mockData.rating % 1 !== 0;
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      starsHTML += '<i class="fa-solid fa-star"></i>';
    } else if (i === fullStars + 1 && hasHalfStar) {
      starsHTML += '<i class="fa-solid fa-star-half-stroke"></i>';
    } else {
      starsHTML += '<i class="fa-regular fa-star"></i>';
    }
  }

  // Renderizar contenido dinámico
  productDetailContent.innerHTML = `
    <div class="detail-grid">
      <!-- Columna Izquierda: Galería Visual -->
      <div class="detail-gallery">
        <img src="${prod.image}" alt="${prod.name}" class="detail-main-img" id="detail-main-image">
        <div class="detail-guarantee-note">
          <i class="fa-solid fa-shield-halved"></i>
          <span>Compra Protegida con Univercelu. Recibe el accesorio que esperas o te devolvemos el dinero en el acto.</span>
        </div>
      </div>
      
      <!-- Columna Derecha: Panel de Compra -->
      <div class="detail-info-panel">
        <span class="detail-sold-tag">Nuevo  |  <span>+${mockData.sold} vendidos</span></span>
        <h2 class="detail-title">${prod.name}</h2>
        
        <div class="detail-rating">
          <div class="rating-stars">
            ${starsHTML}
          </div>
          <span style="font-weight: bold; color: var(--text-main);">${mockData.rating}</span>
          <a href="#" class="rating-count" onclick="return false;">(${mockData.reviews} opiniones)</a>
        </div>
        
        <div class="detail-price-section">
          ${originalPriceHTML}
          <div class="detail-price-row">
            <span class="detail-current-price">$${prod.price.toLocaleString('es-AR')}</span>
            ${discountPercentHTML}
          </div>
        </div>

        <div class="detail-payment-info">
          <div class="payment-row">
            <i class="fa-solid fa-credit-card"></i>
            <span>Mismos precios en <strong>3 o 6 cuotas fijas</strong> de $${installmentPrice.toLocaleString('es-AR')}</span>
          </div>
          <div class="payment-row">
            <i class="fa-solid fa-wallet"></i>
            <span><strong>10% de descuento extra</strong> por Transferencia o Efectivo en local</span>
          </div>
        </div>

        <div class="detail-shipping-info">
          <div class="shipping-row">
            <i class="fa-solid fa-truck-fast"></i>
            <div class="shipping-text">
              <span>Envío rápido a domicilio en <strong>Merlo y alrededores</strong></span>
              <strong>Llega hoy gratis</strong><span> comprando antes de las 18:00 hs</span>
            </div>
          </div>
          <div class="shipping-row">
            <i class="fa-solid fa-house-chimney"></i>
            <div class="shipping-text">
              <span>Retiro en nuestra tienda en <strong>Merlo Centro</strong></span>
              <strong>Gratis hoy mismo</strong><span> (Maipú 510, Lunes a Sábado de 9 a 20 hs)</span>
            </div>
          </div>
        </div>

        <!-- Selector de Cantidad -->
        <div class="detail-quantity-box">
          <span class="detail-quantity-title">Cantidad:</span>
          <div class="detail-quantity-control">
            <button class="qty-control-btn qty-minus" aria-label="Disminuir cantidad">-</button>
            <span class="qty-control-value" id="detail-qty-value">1</span>
            <button class="qty-control-btn qty-plus" aria-label="Aumentar cantidad">+</button>
          </div>
          <span class="qty-stock-label">(Stock: ¡Últimos ${mockData.stock} disponibles!)</span>
        </div>

        <!-- Botones de Acción -->
        <div class="detail-actions-buttons">
          <button class="btn-detail buy-now" id="detail-buy-now-btn">
            <i class="fa-solid fa-bolt"></i> Comprar ahora
          </button>
          <button class="btn-detail add-to-cart" id="detail-add-to-cart-btn">
            <i class="fa-solid fa-basket-shopping"></i> Agregar al carrito
          </button>
        </div>

        <!-- Ficha Técnica -->
        <div class="detail-specs-box">
          <h3 class="detail-specs-title">Características principales</h3>
          <ul class="specs-list">
            ${specsHTML}
          </ul>
        </div>
      </div>
    </div>

    <!-- Descripción Detallada -->
    <div class="detail-description-section">
      <h3 class="detail-desc-title">Descripción del Producto</h3>
      <p class="detail-desc-text">${prod.description} Disfruta del máximo rendimiento, diseño ergonómico de vanguardia y durabilidad excepcional en cada uno de tus dispositivos. Todos los accesorios son 100% probados por nuestro equipo técnico en local de Merlo antes de la entrega para garantizar tu completa seguridad y satisfacción total. Incluye garantía de soporte directo.</p>
    </div>
  `;

  // Lógica del selector de cantidad
  const btnMinus = productDetailContent.querySelector('.qty-minus');
  const btnPlus = productDetailContent.querySelector('.qty-plus');
  const qtyValue = productDetailContent.querySelector('#detail-qty-value');

  btnMinus.addEventListener('click', () => {
    if (selectedQty > 1) {
      selectedQty--;
      qtyValue.textContent = selectedQty;
    }
  });

  btnPlus.addEventListener('click', () => {
    if (selectedQty < mockData.stock) {
      selectedQty++;
      qtyValue.textContent = selectedQty;
    }
  });

  // Evento Comprar Ahora
  const btnBuyNow = productDetailContent.querySelector('#detail-buy-now-btn');
  btnBuyNow.addEventListener('click', () => {
    addToCart(prod.id, selectedQty);
    closeProductDetail();
    setTimeout(() => {
      checkoutWspBtn.click();
    }, 300);
  });

  // Evento Agregar al Carrito
  const btnAddToCart = productDetailContent.querySelector('#detail-add-to-cart-btn');
  btnAddToCart.addEventListener('click', () => {
    addToCart(prod.id, selectedQty);
    closeProductDetail();
    openCart();
  });

  // Mostrar modal y overlay
  productDetailOverlay.classList.add('open');
  productDetailModal.classList.add('open');
  productDetailModal.scrollTop = 0;
  document.body.style.overflow = 'hidden'; // Detener scroll de fondo
}

function closeProductDetail() {
  productDetailOverlay.classList.remove('open');
  productDetailModal.classList.remove('open');
  document.body.style.overflow = ''; // Restaurar scroll
}

// Configurar los manejadores de eventos generales
function setupEventListeners() {
  // Modal de Carrito
  openCartBtn.addEventListener('click', openCart);
  closeCartBtn.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  // Modal de Detalle de Producto
  closeDetailBtn.addEventListener('click', closeProductDetail);
  productDetailOverlay.addEventListener('click', closeProductDetail);

  // Cerrar modales con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCart();
      closeProductDetail();
    }
  });

  // Menú Móvil
  menuToggleBtn.addEventListener('click', () => {
    navbarLinks.classList.toggle('open');
    const isOpened = navbarLinks.classList.contains('open');
    menuToggleBtn.innerHTML = isOpened 
      ? '<i class="fa-solid fa-xmark"></i>' 
      : '<i class="fa-solid fa-bars"></i>';
  });

  // Cerrar menú móvil al hacer click en cualquier link
  navbarLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navbarLinks.classList.remove('open');
      menuToggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    });
  });

  // Filtros de Catálogo
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const category = btn.getAttribute('data-category');
      renderCatalog(category);
    });
  });

  // Botón de Checkout de WhatsApp (Construcción de Pedido Premium)
  checkoutWspBtn.addEventListener('click', () => {
    if (carrito.length === 0) return;

    let totalPrecio = 0;
    let mensaje = `🌌 *¡Hola Univercelu!* Vengo desde su sitio web y quiero realizar el siguiente pedido:\n\n`;
    mensaje += `🛒 *DETALLE DE MI COMPRA:*\n`;
    mensaje += `----------------------------------------\n`;

    carrito.forEach(item => {
      const subtotal = item.price * item.cantidad;
      totalPrecio += subtotal;
      mensaje += `• *${item.cantidad}x* ${item.name}\n  (_$${item.price.toLocaleString('es-AR')} c/u_) → *Subtotal:* $${subtotal.toLocaleString('es-AR')}\n\n`;
    });

    mensaje += `----------------------------------------\n`;
    mensaje += `📦 *Cantidad de artículos:* ${carrito.reduce((acc, cur) => acc + cur.cantidad, 0)}\n`;
    mensaje += `💰 *TOTAL A PAGAR:* $${totalPrecio.toLocaleString('es-AR')}\n\n`;
    mensaje += `📍 _Retiro por sucursal Merlo Centro (Maipú 510)._\n`;
    mensaje += `💬 _¡Muchas gracias! Quedo a la espera de sus datos de pago._`;

    const encodedMessage = encodeURIComponent(mensaje);
    const wspURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Abrir WhatsApp en pestaña nueva
    window.open(wspURL, '_blank');
  });

  // Header opaco al scrollear
  window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (window.scrollY > 50) {
      header.style.background = 'rgba(6, 4, 12, 0.9)';
      header.style.padding = '10px 25px';
    } else {
      header.style.background = 'rgba(6, 4, 12, 0.7)';
      header.style.padding = '15px 25px';
    }
  });
}
