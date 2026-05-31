/* ==========================================================================
   UNIVERCELU - CONTROLADOR DE INTERFAZ (ui-controller.js)
   ========================================================================== */

/**
 * Abre la ventana deslizante del carrito de compras
 */
function openCart() {
  const cartModal = document.getElementById('shopping-cart-modal');
  const cartOverlay = document.getElementById('shopping-cart-overlay');
  
  if (cartModal) cartModal.classList.add('open');
  if (cartOverlay) cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/**
 * Cierra la ventana deslizante del carrito de compras
 */
function closeCart() {
  const cartModal = document.getElementById('shopping-cart-modal');
  const cartOverlay = document.getElementById('shopping-cart-overlay');
  
  if (cartModal) cartModal.classList.remove('open');
  if (cartOverlay) cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

/**
 * Cierra la ventana de detalle de un producto específico
 */
function closeProductDetail() {
  const productDetailOverlay = document.getElementById('product-detail-overlay');
  const productDetailModal = document.getElementById('product-detail-modal');
  
  if (productDetailOverlay) productDetailOverlay.classList.remove('open');
  if (productDetailModal) productDetailModal.classList.remove('open');
  document.body.style.overflow = '';
}

/**
 * Abre el modal detallado estilo Mercado Libre de un producto específico,
 * inyectando carruseles multimedia y especificaciones de forma dinámica.
 */
function openProductDetail(productId) {
  const prod = PRODUCTOS.find(p => p.id === productId);
  if (!prod) return;

  const productDetailContent = document.getElementById('product-detail-content');
  const productDetailOverlay = document.getElementById('product-detail-overlay');
  const productDetailModal = document.getElementById('product-detail-modal');

  if (!productDetailContent) return;

  const mockData = getProductMockData(productId);
  let selectedQty = 1;

  // Precios y descuentos
  const discountPercent = prod.originalPrice 
    ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)
    : 0;

  const originalPriceHTML = prod.originalPrice 
    ? `<span class="detail-original-price">$${prod.originalPrice.toLocaleString('es-AR')}</span>` 
    : '';

  const discountPercentHTML = discountPercent > 0 
    ? `<span class="detail-discount-percent">${discountPercent}% OFF</span>` 
    : '';

  const imagesList = [prod.image, prod.image2, prod.image3].filter(img => img && img.trim() !== "");

  // Generar HTML de galería
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

  // Renderizado dinámico del panel de detalles
  productDetailContent.innerHTML = `
    <div class="detail-grid">
      ${galleryHTML}
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

        <div class="detail-quantity-and-stock">
          <div class="detail-quantity-control-wrapper">
            <span class="detail-qty-label">Cantidad:</span>
            <div class="detail-quantity-control">
              <button class="qty-control-btn qty-minus" aria-label="Disminuir cantidad">-</button>
              <span class="qty-control-value" id="detail-qty-value">1</span>
              <button class="qty-control-btn qty-plus" aria-label="Aumentar cantidad">+</button>
            </div>
          </div>
          <span class="detail-stock-available">(Stock disponible: ${mockData.stock} unidades)</span>
        </div>

        <div class="detail-actions-buttons">
          <button class="btn-detail buy-now" id="detail-buy-now-btn">
            <i class="fa-solid fa-bolt"></i> Comprar ahora
          </button>
          <button class="btn-detail add-to-cart" id="detail-add-to-cart-btn">
            <i class="fa-solid fa-basket-shopping"></i> Agregar al carrito
          </button>
        </div>

        <div class="detail-description-box">
          <h3>Descripción</h3>
          <p>${prod.description}</p>
        </div>
      </div>
    </div>
  `;

  // Carrusel
  if (imagesList.length > 1) {
    const imagesElements = productDetailContent.querySelectorAll('.carousel-images-wrapper img, .carousel-images-wrapper video');
    const prevBtn = productDetailContent.querySelector('#detail-gallery-prev');
    const nextBtn = productDetailContent.querySelector('#detail-gallery-next');
    const dots = productDetailContent.querySelectorAll('.indicator-dot');

    let activeIndex = 0;

    function showImage(index) {
      activeIndex = index;
      imagesElements.forEach((img, idx) => {
        if (idx === index) {
          img.style.display = 'block';
          img.classList.add('active');
          dots[idx].classList.add('active');
          if (img.tagName === 'VIDEO') {
            img.currentTime = 0;
            img.play().catch(e => console.log('Autoplay prevent:', e));
          }
        } else {
          img.style.display = 'none';
          img.classList.remove('active');
          dots[idx].classList.remove('active');
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

  // Controles de cantidad
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

  // Comprar ahora (checkout express)
  const btnBuyNow = productDetailContent.querySelector('#detail-buy-now-btn');
  const checkoutWspBtn = document.getElementById('checkout-whatsapp-btn');
  btnBuyNow.addEventListener('click', () => {
    addToCart(prod.id, selectedQty);
    closeProductDetail();
    setTimeout(() => {
      if (checkoutWspBtn) checkoutWspBtn.click();
    }, 300);
  });

  // Agregar al carrito
  const btnAddToCart = productDetailContent.querySelector('#detail-add-to-cart-btn');
  btnAddToCart.addEventListener('click', () => {
    addToCart(prod.id, selectedQty);
    closeProductDetail();
    openCart();
  });

  // Mostrar modal
  if (productDetailOverlay) productDetailOverlay.classList.add('open');
  if (productDetailModal) {
    productDetailModal.classList.add('open');
    productDetailModal.scrollTop = 0;
  }
  document.body.style.overflow = 'hidden';
}

/**
 * Actualiza el indicador de estado abierto/cerrado según el huso de Argentina (UTC-3)
 * Horario: Lunes a Sábado, 9:30 a 20:00.
 */
function updateStoreStatus() {
  const badge = document.getElementById('store-status-badge');
  if (!badge) return;

  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const argTime = new Date(utc + (-3 * 3600000));

  const day = argTime.getDay();
  const hour = argTime.getHours();
  const min = argTime.getMinutes();
  const currentMinutes = hour * 60 + min;
  const openMinutes = 9 * 60 + 30; // 9:30
  const closeMinutes = 20 * 60;     // 20:00

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

  setTimeout(updateStoreStatus, 60000);
}



