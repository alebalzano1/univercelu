/* ==========================================================================
   Base de Datos de Productos (Sincronizada con Firebase)
   ========================================================================== */
let PRODUCTOS = [];
let CONFIG = {};
let WHATSAPP_NUMBER = "5491136719257"; // Fallback de WhatsApp

/* ==========================================================================
   Función de Optimización de Imágenes de Cloudinary
   ========================================================================== */
function optimizeCloudinaryUrl(url, width = 300) {
  if (!url) return '';
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/w_${width},c_scale,q_auto,f_auto/`);
  }
  return url;
}

// Helper centralizado para formatear precios
function formatPrice(price) {
  return (!price || price === 0) ? 'Consultar' : `$${price.toLocaleString('es-AR')}`;
}

// Indicador de horario abierto/cerrado en tiempo real
function updateStoreStatus() {
  const badge = document.getElementById('store-status-badge');
  if (!badge) return;

  // Horario: Lunes(1) a Sábado(6), 9:30 a 20:00 (hora Argentina UTC-3)
  const now = new Date();
  // Convertir a hora de Argentina (UTC-3)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const argTime = new Date(utc + (-3 * 3600000));

  const day = argTime.getDay();   // 0=Dom, 1=Lun ... 6=Sab
  const hour = argTime.getHours();
  const min = argTime.getMinutes();
  const currentMinutes = hour * 60 + min;
  const openMinutes = 9 * 60 + 30;   // 9:30
  const closeMinutes = 20 * 60;       // 20:00

  const isWeekday = day >= 1 && day <= 6;
  const isInHours = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  const isOpen = isWeekday && isInHours;

  if (isOpen) {
    badge.textContent = '🟢 Abierto ahora';
    badge.className = 'store-status-badge status-open';
  } else {
    badge.textContent = '🔴 Cerrado ahora';
    badge.className = 'store-status-badge status-closed';
  }

  // Actualizar cada minuto
  setTimeout(updateStoreStatus, 60000);
}

/* ==========================================================================
   Variables de Estado y Elementos del DOM
   ========================================================================== */
let carrito = JSON.parse(localStorage.getItem('univercelu_cart')) || [];
let currentSearchQuery = "";
let currentSortOrder = "default";

// Elementos DOM del Catálogo
const productsGrid = document.getElementById('products-catalog-grid');
const filterButtons = document.querySelectorAll('.filter-btn');
const catalogSearchInput = document.getElementById('catalog-search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');

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
const clearCartBtn = document.getElementById('clear-cart-btn');
const nameModalOverlay = document.getElementById('name-modal-overlay');
const nameModal = document.getElementById('name-modal');
const customerNameInput = document.getElementById('customer-name-input');
const nameModalConfirmBtn = document.getElementById('name-modal-confirm-btn');
const nameModalCancelBtn = document.getElementById('name-modal-cancel-btn');

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
document.addEventListener('DOMContentLoaded', async () => {
  updateStoreStatus();
  // Renderizar Skeletons de forma inmediata en la grilla para feedback visual premium
  renderSkeletons();
  updateCartUI();
  setupEventListeners();

  try {
    // Consultar datos asíncronamente desde Firebase (con fallback a local Sandbox)
    const [fetchedProducts, fetchedConfig] = await Promise.all([
      FirebaseService.getProducts(),
      FirebaseService.getConfig()
    ]);

    // Si la DB tiene productos, los usamos; si no, recurrimos al seed por defecto
    PRODUCTOS = fetchedProducts && fetchedProducts.length > 0 ? fetchedProducts : window.initialProducts;
    CONFIG = fetchedConfig || window.initialConfig;

    // Sincronizar variables clave
    WHATSAPP_NUMBER = CONFIG.whatsapp || "5491136719257";

    // Aplicar configuración a todo el DOM de la web
    applyStoreConfiguration();
  } catch (error) {
    console.error("❌ [Firebase Init Error]:", error);
    PRODUCTOS = window.initialProducts;
    CONFIG = window.initialConfig;
    WHATSAPP_NUMBER = "5491136719257";
  }

  // Renderizar catálogo real una vez cargados los productos
  renderCatalog('todos');
  renderFeatured();
  updateFilterCounts();
});

// Renderizar Skeletons de carga premium con animación galáctica
function renderSkeletons() {
  productsGrid.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const card = document.createElement('div');
    card.className = 'product-card skeleton-card glass-card';
    card.innerHTML = `
      <div class="skeleton-img"></div>
      <div class="skeleton-details">
        <div class="skeleton-line category"></div>
        <div class="skeleton-line name"></div>
        <div class="skeleton-line desc"></div>
        <div class="skeleton-line price"></div>
      </div>
    `;
    productsGrid.appendChild(card);
  }
}

// Renderizar sección de productos destacados
function renderFeatured() {
  const featuredGrid = document.getElementById('featured-products-grid');
  if (!featuredGrid) return;

  const destacados = PRODUCTOS.filter(p => p.featured && p.available);
  if (destacados.length === 0) {
    document.getElementById('destacados')?.style.setProperty('display', 'none');
    return;
  }

  featuredGrid.innerHTML = '';
  destacados.forEach((prod, index) => {
    const isConsultar = !prod.price || prod.price === 0;

    const card = document.createElement('div');
    card.className = 'featured-card glass-card';
    card.style.animation = `fadeSlideIn 0.5s ease-out ${index * 0.07}s both`;
    card.style.cursor = 'pointer';

    card.innerHTML = `
      <div class="featured-card-img">
        <img src="${optimizeCloudinaryUrl(prod.image, 260)}" alt="${prod.name}" loading="lazy">
        ${prod.badge ? `<div class="product-badge">${prod.badge}</div>` : ''}
      </div>
      <div class="featured-card-info">
        <span class="featured-card-name">${prod.name}</span>
        <span class="featured-card-price">${isConsultar ? 'Consultar' : formatPrice(prod.price)}</span>
      </div>
    `;

    card.addEventListener('click', () => openProductDetail(prod.id));
    featuredGrid.appendChild(card);
  });
}

// Actualizar contadores de cantidad por categoría en los filtros
function updateFilterCounts() {
  const categoryCounts = {};
  PRODUCTOS.forEach(p => {
    if (!categoryCounts[p.category]) categoryCounts[p.category] = 0;
    categoryCounts[p.category]++;
  });
  const total = PRODUCTOS.length;

  // Actualizar botón "Todos"
  const allBtn = document.getElementById('filter-btn-all');
  if (allBtn) allBtn.innerHTML = `Todos <span class="filter-count">${total}</span>`;

  // Actualizar cada botón de categoría
  const filterBtns = document.querySelectorAll('.filter-btn[data-category]');
  filterBtns.forEach(btn => {
    const cat = btn.getAttribute('data-category');
    if (cat === 'todos') return;
    const count = categoryCounts[cat] || 0;
    if (count > 0) {
      btn.innerHTML = `${btn.textContent.trim()} <span class="filter-count">${count}</span>`;
    }
  });
}

// Aplicar configuración general dinámica al DOM de la web
function applyStoreConfiguration() {
  if (!CONFIG) return;

  // Actualizar título de la web y logos
  if (CONFIG.storeName) {
    document.title = `${CONFIG.storeName} | ${CONFIG.tagline || 'Accesorios y Servicio Técnico de Celulares'}`;
    
    const logoHeader = document.querySelector('#logo-header span');
    if (logoHeader) logoHeader.textContent = CONFIG.storeName;
    
    const logoFooter = document.querySelector('#logo-footer span');
    if (logoFooter) logoFooter.textContent = CONFIG.storeName;
  }

  // Actualizar tarjeta de ubicación
  const locCard = document.getElementById('info-card-location');
  if (locCard && CONFIG.deliveryZone) {
    const pTags = locCard.querySelectorAll('p');
    if (pTags.length >= 2) {
      pTags[0].textContent = CONFIG.deliveryZone;
    }
  }

  // Actualizar enlaces dinámicos de WhatsApp
  const floatingWsp = document.getElementById('floating-whatsapp-btn');
  if (floatingWsp && CONFIG.whatsapp) {
    floatingWsp.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.welcomeMessage || 'Hola! Me contacto desde la web.')}`;
  }

  const footerWsp = document.getElementById('footer-social-whatsapp');
  if (footerWsp && CONFIG.whatsapp) {
    footerWsp.href = `https://wa.me/${CONFIG.whatsapp}`;
  }

  // Actualizar pie de página (copyright)
  const copyEl = document.getElementById('footer-copyright-text');
  if (copyEl && CONFIG.storeName) {
    copyEl.innerHTML = `&copy; 2026 ${CONFIG.storeName}. Todos los derechos reservados. | ${CONFIG.deliveryZone || 'Maipú 510, Merlo Centro'}.`;
  }
}

// Renderizar catálogo filtrado
function renderCatalog(categoryFilter) {
  productsGrid.innerHTML = '';
  
  const categoryFiltered = categoryFilter === 'todos' 
    ? PRODUCTOS 
    : PRODUCTOS.filter(p => p.category === categoryFilter);

  const query = currentSearchQuery.toLowerCase().trim();
  let productosFiltrados = query === ''
    ? categoryFiltered
    : categoryFiltered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.description && p.description.toLowerCase().includes(query)) ||
        p.category.toLowerCase().includes(query)
      );

  // Ordenamiento configurable
  if (currentSortOrder === 'price-asc') {
    productosFiltrados.sort((a, b) => {
      const pa = (!a.price || a.price === 0) ? Infinity : a.price;
      const pb = (!b.price || b.price === 0) ? Infinity : b.price;
      return pa - pb;
    });
  } else if (currentSortOrder === 'price-desc') {
    productosFiltrados.sort((a, b) => {
      const pa = (!a.price || a.price === 0) ? -Infinity : a.price;
      const pb = (!b.price || b.price === 0) ? -Infinity : b.price;
      return pb - pa;
    });
  } else if (currentSortOrder === 'name-az') {
    productosFiltrados.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  } else if (currentSortOrder === 'name-za') {
    productosFiltrados.sort((a, b) => b.name.localeCompare(a.name, 'es'));
  }

  // Manejo de cero resultados (búsqueda vacía) con estética galáctica
  if (productosFiltrados.length === 0) {
    productsGrid.innerHTML = `
      <div class="no-results-message">
        <i class="fa-solid fa-satellite-dish"></i>
        <h3>Búsqueda sin señal...</h3>
        <p>No encontramos ningún producto que coincida con "${currentSearchQuery}".</p>
        <button class="btn-premium btn-outline" id="reset-search-btn">
          Ver todos los productos <i class="fa-solid fa-sparkles"></i>
        </button>
      </div>
    `;

    document.getElementById('reset-search-btn').addEventListener('click', () => {
      catalogSearchInput.value = '';
      currentSearchQuery = '';
      clearSearchBtn.style.display = 'none';
      
      // Restablecer filtro de categoría activo a "todos" para mejor experiencia
      filterButtons.forEach(b => b.classList.remove('active'));
      const allBtn = document.getElementById('filter-btn-all');
      if (allBtn) allBtn.classList.add('active');
      
      renderCatalog('todos');
      catalogSearchInput.focus();
    });
    return;
  }

  productosFiltrados.forEach((prod, index) => {
    const card = document.createElement('div');
    card.className = 'product-card glass-card';
    card.id = `prod-${prod.id}`;
    card.style.cursor = 'pointer';

    const badgeHTML = prod.badge 
      ? `<div class="product-badge">${prod.badge}</div>` 
      : '';

    // Calcular descuento en porcentaje comparando originalPrice y price
    let discountHTML = '';
    if (prod.originalPrice && prod.price && prod.originalPrice > prod.price) {
      const pct = Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100);
      discountHTML = `<div class="product-discount-tag">-${pct}% OFF</div>`;
    }

    const isConsultar = !prod.price || prod.price === 0;

    // Leyenda de transferencia (10% de descuento)
    let transferPriceHTML = '';
    if (!isConsultar) {
      const transferPrice = Math.round(prod.price * 0.9);
      transferPriceHTML = `<div class="product-transfer-price">$${transferPrice.toLocaleString('es-AR')} con 10% OFF en efectivo o transferencia</div>`;
    }

    // Precios formateados
    const priceHTML = isConsultar
      ? `<span class="current-price">Consultar</span>`
      : `<span class="current-price">${formatPrice(prod.price)}</span>${prod.originalPrice ? ` <span class="old-price">${formatPrice(prod.originalPrice)}</span>` : ''}`;

    card.innerHTML = `
      ${badgeHTML}
      <div class="product-image-container">
        <img src="${optimizeCloudinaryUrl(prod.image, 300)}" alt="${prod.name}" loading="lazy">
      </div>
      <div class="product-details">
        <h3 class="product-name">${prod.name}</h3>
        ${discountHTML}
        <div class="product-price-row">
          ${priceHTML}
        </div>
        ${transferPriceHTML}
        <button class="add-to-cart-btn" data-id="${prod.id}">
          COMPRAR
        </button>
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

  // Intersection Observer para animación de entrada suave al hacer scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Solo animar una vez
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px'
  });

  productsGrid.querySelectorAll('.product-card').forEach(card => {
    observer.observe(card);
  });
}

// Estilos de animación keyframe temporales y Skeletons de carga añadidos programáticamente
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

  /* Skeletons de Carga Premium - Estilo Galáctico */
  .skeleton-card {
    pointer-events: none !important;
    background: rgba(255, 255, 255, 0.02) !important;
    border-color: rgba(255, 255, 255, 0.04) !important;
    box-shadow: none !important;
  }
  .skeleton-img {
    height: 160px;
    background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 75%);
    background-size: 200% 100%;
    animation: skeleton-pulse 1.6s infinite;
    border-radius: 12px;
    margin: 15px;
  }
  .skeleton-line {
    height: 12px;
    background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 75%);
    background-size: 200% 100%;
    animation: skeleton-pulse 1.6s infinite;
    margin-bottom: 12px;
    border-radius: 4px;
  }
  .skeleton-line.category { width: 40%; height: 8px; }
  .skeleton-line.name { width: 80%; height: 16px; margin-bottom: 15px; }
  .skeleton-line.desc { width: 95%; height: 8px; }
  .skeleton-line.price { width: 35%; height: 14px; margin-top: 20px; }

  @keyframes skeleton-pulse {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* Estilos del modal simplificado */
  .detail-highlights-box {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 16px;
    margin: 20px 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .highlight-item {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    color: var(--muted);
  }
  .highlight-item i {
    font-size: 16px;
    color: var(--primary-glow);
    width: 20px;
    text-align: center;
  }
  .detail-description-box {
    margin-top: 25px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }
  .detail-description-box h3 {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 18px;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
    color: var(--text-main);
  }
  .detail-description-box p {
    font-size: 14px;
    line-height: 1.6;
    color: var(--muted);
  }
  .detail-badge-tag {
    display: inline-block;
    padding: 4px 10px;
    background: var(--primary-glow);
    color: #fff;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    border-radius: 6px;
    margin-bottom: 10px;
    box-shadow: 0 0 10px rgba(168, 85, 247, 0.3);
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
    if (clearCartBtn) clearCartBtn.style.display = 'none';
  } else {
    checkoutWspBtn.style.opacity = '1';
    checkoutWspBtn.style.pointerEvents = 'all';
    if (clearCartBtn) clearCartBtn.style.display = 'flex';

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
          <span class="cart-item-price">${formatPrice(item.price * item.cantidad)}</span>
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

  // Actualizar totales y contadores (siempre, independientemente de si hay items o no)
  cartCounter.textContent = totalArticulos;
  cartSummaryQty.textContent = totalArticulos;

  // Detectar si hay ítems sin precio
  const tieneItemsSinPrecio = carrito.some(i => !i.price || i.price === 0);
  const tieneItemsConPrecio = carrito.some(i => i.price && i.price > 0);

  let totalDisplay;
  if (tieneItemsConPrecio && tieneItemsSinPrecio) {
    totalDisplay = `$${totalPrecio.toLocaleString('es-AR')} + consultar`;
  } else if (tieneItemsConPrecio) {
    totalDisplay = `$${totalPrecio.toLocaleString('es-AR')}`;
  } else {
    totalDisplay = 'Consultar';
  }
  cartSummaryTotal.textContent = totalDisplay;
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
  
  // Stock disponible simulado determinista entre 3 y 7
  const stock = 3 + (hash % 5);
  
  return { stock };
}

function isVideoUrl(url) {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.quicktime'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.endsWith(ext)) || lowerUrl.includes('/video/upload/');
}

/* Lógica del Modal Detalle de Producto Simplificado y de Alto Impacto */
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

  // Obtener arreglo de fotos válidas
  const imagesList = [prod.image, prod.image2, prod.image3].filter(img => img && img.trim() !== "");

  // Generar HTML de la galería según tenga 1 o más imágenes
  let galleryHTML = '';
  if (imagesList.length > 1) {
    let imagesHTML = '';
    let dotsHTML = '';
    
    imagesList.forEach((url, idx) => {
      if (isVideoUrl(url)) {
        imagesHTML += `<video src="${url}" class="detail-main-img ${idx === 0 ? 'active' : ''}" id="detail-img-${idx}" data-index="${idx}" style="${idx === 0 ? '' : 'display: none;'}" autoplay loop muted playsinline controls></video>`;
      } else {
        imagesHTML += `<img src="${optimizeCloudinaryUrl(url, 500)}" alt="${prod.name} - ${idx + 1}" class="detail-main-img ${idx === 0 ? 'active' : ''}" id="detail-img-${idx}" data-index="${idx}" style="${idx === 0 ? '' : 'display: none;'}">`;
      }
      dotsHTML += `<span class="indicator-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></span>`;
    });

    galleryHTML = `
      <div class="detail-gallery-carousel">
        <button class="carousel-nav-btn prev" id="detail-gallery-prev" aria-label="Foto anterior">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <div class="carousel-images-wrapper">
          ${imagesHTML}
        </div>
        <button class="carousel-nav-btn next" id="detail-gallery-next" aria-label="Siguiente foto">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
        <div class="carousel-indicators">
          ${dotsHTML}
        </div>
        <div class="detail-guarantee-note" style="margin-top: 15px; width: 100%;">
          <i class="fa-solid fa-shield-halved"></i>
          <span>Garantía oficial y soporte directo en local</span>
        </div>
      </div>
    `;
  } else {
    const singleMedia = isVideoUrl(prod.image)
      ? `<video src="${prod.image}" class="detail-main-img" id="detail-main-image" autoplay loop muted playsinline controls style="width: 100%; border-radius: 12px; object-fit: cover;"></video>`
      : `<img src="${optimizeCloudinaryUrl(prod.image || 'assets/placeholder.png', 500)}" alt="${prod.name}" class="detail-main-img" id="detail-main-image">`;

    galleryHTML = `
      <div class="detail-gallery">
        ${singleMedia}
        <div class="detail-guarantee-note">
          <i class="fa-solid fa-shield-halved"></i>
          <span>Garantía oficial y soporte directo en local</span>
        </div>
      </div>
    `;
  }

  // Renderizar contenido dinámico conciso y elegante
  productDetailContent.innerHTML = `
    <div class="detail-grid">
      <!-- Columna Izquierda: Galería Visual Premium -->
      ${galleryHTML}
      
      <!-- Columna Derecha: Panel de Detalles Conciso y Estilizado -->
      <div class="detail-info-panel">
        ${prod.badge ? `<span class="detail-badge-tag">${prod.badge}</span>` : ''}
        <h2 class="detail-title">${prod.name}</h2>
        
        <div class="detail-price-section">
          ${originalPriceHTML}
          <div class="detail-price-row">
            <span class="detail-current-price">${(!prod.price || prod.price === 0) ? 'Consultar' : `$${prod.price.toLocaleString('es-AR')}`}</span>
            ${discountPercentHTML}
          </div>
        </div>

        <!-- Tarjeta de Beneficios Minimalistas -->
        <div class="detail-benefits-box">
          <div class="benefit-item">
            <i class="fa-solid fa-credit-card"></i>
            <span>💳 3 y 6 cuotas fijas · <strong>10% OFF</strong> en Efectivo/Transferencia</span>
          </div>
          <div class="benefit-item">
            <i class="fa-solid fa-truck-fast"></i>
            <span>📍 Retiro gratis en tienda (Maipú 510) · Envío rápido</span>
          </div>
        </div>

        <!-- Selector de Cantidad Minimalista -->
        <div class="detail-quantity-and-stock">
          <div class="detail-quantity-control-wrapper">
            <span class="detail-qty-label">Cantidad:</span>
            <div class="detail-quantity-control">
              <button class="qty-control-btn qty-minus" aria-label="Disminuir cantidad">-</button>
              <span class="qty-control-value" id="detail-qty-value">1</span>
              <button class="qty-control-btn qty-plus" aria-label="Aumentar cantidad">+</button>
            </div>
          </div>
        </div>

        <!-- Botones de Acción Rápidos -->
        <div class="detail-actions-buttons">
          <button class="btn-detail buy-now" id="detail-buy-now-btn">
            <i class="fa-solid fa-bolt"></i> Comprar ahora
          </button>
          <button class="btn-detail add-to-cart" id="detail-add-to-cart-btn">
            <i class="fa-solid fa-basket-shopping"></i> Agregar al carrito
          </button>
        </div>

        <!-- Descripción Simplificada e Integrada -->
        <div class="detail-description-box">
          <h3>Descripción</h3>
          <p>${prod.description}</p>
        </div>
      </div>
    </div>
  `;

  // Lógica del carrusel si el producto tiene más de 1 imagen
  if (imagesList.length > 1) {
    const imagesElements = productDetailContent.querySelectorAll('.carousel-images-wrapper img, .carousel-images-wrapper video');
    const prevBtn = productDetailContent.querySelector('#detail-gallery-prev');
    const nextBtn = productDetailContent.querySelector('#detail-gallery-next');
    const dots = productDetailContent.querySelectorAll('.indicator-dot');

    let activeIndex = 0;

    function showImage(index) {
      activeIndex = index;
      
      // Ocultar todas las imágenes/videos y desactivar dots
      imagesElements.forEach((img, idx) => {
        if (idx === index) {
          img.style.display = 'block';
          img.classList.add('active');
          dots[idx].classList.add('active');
          // Si es un video, reproducirlo automáticamente
          if (img.tagName === 'VIDEO') {
            img.currentTime = 0;
            img.play().catch(e => console.log('Autoplay prevent:', e));
          }
        } else {
          img.style.display = 'none';
          img.classList.remove('active');
          dots[idx].classList.remove('active');
          // Si es un video, pausarlo
          if (img.tagName === 'VIDEO') {
            img.pause();
          }
        }
      });
    }

    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      let nextIndex = (activeIndex - 1 + imagesList.length) % imagesList.length;
      showImage(nextIndex);
    });

    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      let nextIndex = (activeIndex + 1) % imagesList.length;
      showImage(nextIndex);
    });

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        showImage(idx);
      });
    });
  }

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

function enviarPedidoWhatsApp() {
  const nombre = customerNameInput.value.trim();

  let totalPrecio = 0;
  let tienePrecios = false;
  let listaProductos = '';

  carrito.forEach(item => {
    const isConsultar = (!item.price || item.price === 0);
    if (!isConsultar) {
      const subtotal = item.price * item.cantidad;
      totalPrecio += subtotal;
      tienePrecios = true;
    }
    const priceEachStr = isConsultar ? 'Consultar' : `$${item.price.toLocaleString('es-AR')}`;
    listaProductos += `- ${item.cantidad}x ${item.name} (${priceEachStr})\n`;
  });

  const hayItemsSinPrecio = carrito.some(i => !i.price || i.price === 0);
  let totalStr;
  if (tienePrecios && hayItemsSinPrecio) {
    totalStr = `$${totalPrecio.toLocaleString('es-AR')} + consultar precio de ítems sin precio`;
  } else if (tienePrecios) {
    totalStr = `$${totalPrecio.toLocaleString('es-AR')}`;
  } else {
    totalStr = 'Consultar';
  }

  const saludo = nombre
    ? `Hola, soy *${nombre}*! Te hago el siguiente pedido desde la web:\n`
    : `Hola Univercelu! Te hago el siguiente pedido desde la web:\n`;

  let mensaje = saludo;
  mensaje += listaProductos;
  mensaje += `Total: ${totalStr}\n`;
  mensaje += `Quedo a la espera, gracias!`;

  // Cerrar modal de nombre
  nameModal.classList.remove('open');
  nameModalOverlay.classList.remove('open');
  document.body.style.overflow = '';

  const encodedMessage = encodeURIComponent(mensaje);
  const wspURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
  window.open(wspURL, '_blank');

  // Toast de confirmación
  const toastEl = document.createElement('div');
  toastEl.className = 'wsp-sent-toast';
  toastEl.innerHTML = `
    <i class="fa-brands fa-whatsapp"></i>
    <span>¡Pedido enviado! Vas a recibir respuesta pronto.</span>
  `;
  document.body.appendChild(toastEl);
  setTimeout(() => toastEl.classList.add('visible'), 50);
  setTimeout(() => {
    toastEl.classList.remove('visible');
    setTimeout(() => toastEl.remove(), 400);
  }, 3500);
}

// Configurar los manejadores de eventos generales
function setupEventListeners() {
  // Modal de Carrito
  openCartBtn.addEventListener('click', openCart);
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      if (confirm('¿Vaciar el carrito? Se eliminarán todos los productos.')) {
        carrito = [];
        saveCart();
        updateCartUI();
      }
    });
  }
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

  // Buscador de Catálogo (Búsqueda en tiempo real)
  if (catalogSearchInput) {
    catalogSearchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      
      // Mostrar/Ocultar botón de borrado rápido
      if (currentSearchQuery.length > 0) {
        clearSearchBtn.style.display = 'block';
      } else {
        clearSearchBtn.style.display = 'none';
      }
      
      // Obtener la categoría activa
      const activeFilterBtn = document.querySelector('.filter-btn.active');
      const activeCategory = activeFilterBtn ? activeFilterBtn.getAttribute('data-category') : 'todos';
      
      renderCatalog(activeCategory);
    });
  }

  // Limpiar buscador
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      catalogSearchInput.value = '';
      currentSearchQuery = '';
      clearSearchBtn.style.display = 'none';
      
      // Re-renderizar catálogo con categoría activa
      const activeFilterBtn = document.querySelector('.filter-btn.active');
      const activeCategory = activeFilterBtn ? activeFilterBtn.getAttribute('data-category') : 'todos';
      
      renderCatalog(activeCategory);
      catalogSearchInput.focus();
    });
  }


  // Botón de Checkout de WhatsApp — abre modal de nombre primero
  checkoutWspBtn.addEventListener('click', () => {
    if (carrito.length === 0) return;
    // Mostrar modal de nombre
    customerNameInput.value = '';
    nameModal.classList.add('open');
    nameModalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => customerNameInput.focus(), 200);
  });

  // Cancelar modal de nombre
  nameModalCancelBtn.addEventListener('click', () => {
    nameModal.classList.remove('open');
    nameModalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  });

  nameModalOverlay.addEventListener('click', () => {
    nameModal.classList.remove('open');
    nameModalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  });

  // Confirmar nombre y enviar a WhatsApp
  nameModalConfirmBtn.addEventListener('click', () => {
    enviarPedidoWhatsApp();
  });

  customerNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') enviarPedidoWhatsApp();
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

  // Efecto 3D Parallax Tilt e Interactivo en el Hero (Servicio Técnico de Celulares)
  const heroImageWrapper = document.querySelector('.hero-image-wrapper');
  if (heroImageWrapper) {
    const hintText = heroImageWrapper.querySelector('.hint-text');
    
    // Detectar soporte de pantalla táctil
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouch && hintText) {
      hintText.textContent = "Toca para desarmar";
    }

    // 1. Efecto 3D Tilt al mover el mouse (solo para computadoras de escritorio)
    if (!isTouch) {
      heroImageWrapper.addEventListener('mousemove', (e) => {
        const rect = heroImageWrapper.getBoundingClientRect();
        
        // Coordenadas locales del mouse dentro de la tarjeta
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Puntos medios de la tarjeta
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calcular la inclinación en grados (máximo 15 grados)
        const rotateX = ((centerY - y) / centerY) * 15;
        const rotateY = ((x - centerX) / centerX) * 15;
        
        // Aplicar transformación 3D al contenedor (inclinación en los ejes X e Y + escala)
        heroImageWrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
      });
      
      // Restablecer la inclinación 3D del contenedor al retirar el mouse
      heroImageWrapper.addEventListener('mouseleave', () => {
        heroImageWrapper.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      });
    }

    // 2. Control de Taps / Clics (Soporte móvil táctil e interactivo)
    heroImageWrapper.addEventListener('click', () => {
      const isActive = heroImageWrapper.classList.toggle('active-tap');
      if (isTouch && hintText) {
        hintText.textContent = isActive ? "Toca para armar" : "Toca para desarmar";
      }
    });
  }

  // Selector de Ordenamiento
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSortOrder = e.target.value;
      const activeFilterBtn = document.querySelector('.filter-btn.active');
      const activeCategory = activeFilterBtn ? activeFilterBtn.getAttribute('data-category') : 'todos';
      renderCatalog(activeCategory);
    });
  }
}
