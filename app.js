/* ==========================================================================
   UNIVERCELU - COORDINADOR GLOBAL (app.js)
   ========================================================================== */

// --- Variables de Estado Globales (Compartidas por los módulos) ---
let PRODUCTOS = [];
let CONFIG = {};
let WHATSAPP_NUMBER = "5491136719257"; // Fallback
let carrito = JSON.parse(localStorage.getItem('univercelu_cart')) || [];
let currentSearchQuery = "";
let currentSortOrder = "default";

// --- Estilos Temporales Skeletons inyectados programáticamente ---
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
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

/**
 * Aplica configuraciones dinámicas de marca y local al DOM del sitio
 */
function applyStoreConfiguration() {
  if (!CONFIG) return;

  if (CONFIG.storeName) {
    document.title = `${CONFIG.storeName} | ${CONFIG.tagline || 'Accesorios y Servicio Técnico de Celulares'}`;
    const logoHeader = document.querySelector('#logo-header span');
    if (logoHeader) logoHeader.textContent = CONFIG.storeName;
    const logoFooter = document.querySelector('#logo-footer span');
    if (logoFooter) logoFooter.textContent = CONFIG.storeName;
  }

  const locCard = document.getElementById('info-card-location');
  if (locCard && CONFIG.deliveryZone) {
    const pTags = locCard.querySelectorAll('p');
    if (pTags.length >= 2) pTags[0].textContent = CONFIG.deliveryZone;
  }

  const floatingWsp = document.getElementById('floating-whatsapp-btn');
  if (floatingWsp && CONFIG.whatsapp) {
    floatingWsp.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.welcomeMessage || 'Hola! Me contacto desde la web.')}`;
  }

  const footerWsp = document.getElementById('footer-social-whatsapp');
  if (footerWsp && CONFIG.whatsapp) {
    footerWsp.href = `https://wa.me/${CONFIG.whatsapp}`;
  }

  const copyEl = document.getElementById('footer-copyright-text');
  if (copyEl && CONFIG.storeName) {
    copyEl.innerHTML = `&copy; 2026 ${CONFIG.storeName}. Todos los derechos reservados. | ${CONFIG.deliveryZone || 'Maipú 510, Merlo Centro'}.`;
  }
}

/**
 * Configura todos los manejadores de eventos principales de la web
 */
function setupEventListeners() {
  // Modal Carrito
  const openCartBtn = document.getElementById('open-cart-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartOverlay = document.getElementById('shopping-cart-overlay');
  const clearCartBtn = document.getElementById('clear-cart-btn');

  if (openCartBtn) openCartBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      if (confirm('¿Vaciar el carrito? Se eliminarán todos los productos.')) {
        carrito = [];
        saveCart();
        updateCartUI();
      }
    });
  }

  // Detalle Producto Modal
  const closeDetailBtn = document.getElementById('close-detail-btn');
  const productDetailOverlay = document.getElementById('product-detail-overlay');
  if (closeDetailBtn) closeDetailBtn.addEventListener('click', closeProductDetail);
  if (productDetailOverlay) productDetailOverlay.addEventListener('click', closeProductDetail);

  // Cerrar modales con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCart();
      closeProductDetail();
    }
  });

  // Hamburguesa móvil
  const menuToggleBtn = document.getElementById('menu-toggle-btn');
  const navbarLinks = document.getElementById('navbar-links');
  if (menuToggleBtn && navbarLinks) {
    menuToggleBtn.addEventListener('click', () => {
      navbarLinks.classList.toggle('open');
      const isOpened = navbarLinks.classList.contains('open');
      menuToggleBtn.innerHTML = isOpened 
        ? '<i class="fa-solid fa-xmark"></i>' 
        : '<i class="fa-solid fa-bars"></i>';
    });

    navbarLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navbarLinks.classList.remove('open');
        menuToggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
      });
    });
  }

  // Filtros del Catálogo
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.getAttribute('data-category');
      renderCatalog(category);
    });
  });

  // Buscador de Catálogo (Búsqueda en tiempo real)
  const catalogSearchInput = document.getElementById('catalog-search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');

  if (catalogSearchInput) {
    catalogSearchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      if (clearSearchBtn) {
        clearSearchBtn.style.display = currentSearchQuery.length > 0 ? 'block' : 'none';
      }
      const activeFilterBtn = document.querySelector('.filter-btn.active');
      const activeCategory = activeFilterBtn ? activeFilterBtn.getAttribute('data-category') : 'todos';
      renderCatalog(activeCategory);
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (catalogSearchInput) catalogSearchInput.value = '';
      currentSearchQuery = '';
      clearSearchBtn.style.display = 'none';
      
      const activeFilterBtn = document.querySelector('.filter-btn.active');
      const activeCategory = activeFilterBtn ? activeFilterBtn.getAttribute('data-category') : 'todos';
      renderCatalog(activeCategory);
      if (catalogSearchInput) catalogSearchInput.focus();
    });
  }

  // Checkout de WhatsApp (abre modal de nombre)
  const checkoutWspBtn = document.getElementById('checkout-whatsapp-btn');
  const customerNameInput = document.getElementById('customer-name-input');
  const nameModal = document.getElementById('name-modal');
  const nameModalOverlay = document.getElementById('name-modal-overlay');
  const nameModalCancelBtn = document.getElementById('name-modal-cancel-btn');
  const nameModalConfirmBtn = document.getElementById('name-modal-confirm-btn');

  if (checkoutWspBtn && customerNameInput && nameModal && nameModalOverlay) {
    checkoutWspBtn.addEventListener('click', () => {
      if (carrito.length === 0) return;
      customerNameInput.value = '';
      nameModal.classList.add('open');
      nameModalOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => customerNameInput.focus(), 200);
    });

    if (nameModalCancelBtn) {
      nameModalCancelBtn.addEventListener('click', () => {
        nameModal.classList.remove('open');
        nameModalOverlay.classList.remove('open');
        document.body.style.overflow = '';
      });
    }

    nameModalOverlay.addEventListener('click', () => {
      nameModal.classList.remove('open');
      nameModalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    });

    if (nameModalConfirmBtn) {
      nameModalConfirmBtn.addEventListener('click', () => enviarPedidoWhatsApp());
    }

    customerNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') enviarPedidoWhatsApp();
    });
  }

  // Scroll del Header
  window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (header) {
      if (window.scrollY > 50) {
        header.style.background = 'rgba(6, 4, 12, 0.9)';
        header.style.padding = '10px 25px';
      } else {
        header.style.background = 'rgba(6, 4, 12, 0.7)';
        header.style.padding = '15px 25px';
      }
    }
  });

  // Efecto 3D Parallax Tilt e Interactivo en el Hero
  const heroImageWrapper = document.querySelector('.hero-image-wrapper');
  if (heroImageWrapper) {
    const hintText = heroImageWrapper.querySelector('.hint-text');
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouch && hintText) {
      hintText.textContent = "Toca para desarmar";
    }

    if (!isTouch) {
      heroImageWrapper.addEventListener('mousemove', (e) => {
        const rect = heroImageWrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((centerY - y) / centerY) * 15;
        const rotateY = ((x - centerX) / centerX) * 15;
        heroImageWrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
      });
      
      heroImageWrapper.addEventListener('mouseleave', () => {
        heroImageWrapper.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      });
    }

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

// --- Inicialización Principal al Cargar el DOM ---
document.addEventListener('DOMContentLoaded', async () => {
  updateStoreStatus();
  renderSkeletons();
  updateCartUI();
  setupEventListeners();

  try {
    const [fetchedProducts, fetchedConfig] = await Promise.all([
      FirebaseService.getProducts(),
      FirebaseService.getConfig()
    ]);

    PRODUCTOS = fetchedProducts && fetchedProducts.length > 0 ? fetchedProducts : window.initialProducts;
    CONFIG = fetchedConfig || window.initialConfig;

    WHATSAPP_NUMBER = CONFIG.whatsapp || "5491136719257";
    applyStoreConfiguration();
  } catch (error) {
    console.error("❌ [Firebase Init Error]:", error);
    PRODUCTOS = window.initialProducts;
    CONFIG = window.initialConfig;
    WHATSAPP_NUMBER = "5491136719257";
  }

  renderCatalog('todos');
  renderFeatured();
  updateFilterCounts();
});
