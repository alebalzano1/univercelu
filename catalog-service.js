/* ==========================================================================
   UNIVERCELU - SERVICIO DE CATÁLOGO (catalog-service.js)
   ========================================================================== */

/**
 * Optimiza la URL de una imagen alojada en Cloudinary estableciendo dimensiones,
 * calidad y formato automáticos para agilizar la carga del sitio.
 */
function optimizeCloudinaryUrl(url, width = 300) {
  if (!url) return '';
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/w_${width},c_scale,q_auto,f_auto/`);
  }
  return url;
}

/**
 * Formatea un precio numérico al formato de pesos argentinos.
 * Retorna 'Consultar' si el precio no está definido o es cero.
 */
function formatPrice(price) {
  return (!price || price === 0) ? 'Consultar' : `$${price.toLocaleString('es-AR')}`;
}

/**
 * Obtiene datos simulados de stock de forma determinista basados en el ID del producto
 * para dotar de realismo a la experiencia del cliente.
 */
function getProductMockData(productId) {
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash += productId.charCodeAt(i);
  }
  const stock = 3 + (hash % 5); // Stock determinista entre 3 y 7
  return { stock };
}

/**
 * Determina si una URL corresponde a un archivo de video
 */
function isVideoUrl(url) {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.quicktime'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.endsWith(ext)) || lowerUrl.includes('/video/upload/');
}

/**
 * Dibuja skeletons (cajas grises animadas) en la grilla para simular
 * una carga progresiva ultra-rápida y premium.
 */
function renderSkeletons() {
  const productsGrid = document.getElementById('products-catalog-grid');
  if (!productsGrid) return;
  
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

/**
 * Renderiza la sección de productos más buscados o destacados
 */
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

/**
 * Actualiza los contadores dinámicos de cantidad por categoría en los botones de filtrado
 */
function updateFilterCounts() {
  const categoryCounts = {};
  PRODUCTOS.forEach(p => {
    if (!categoryCounts[p.category]) categoryCounts[p.category] = 0;
    categoryCounts[p.category]++;
  });
  const total = PRODUCTOS.length;

  const allBtn = document.getElementById('filter-btn-all');
  if (allBtn) allBtn.innerHTML = `Todos <span class="filter-count">${total}</span>`;

  const filterBtns = document.querySelectorAll('.filter-btn[data-category]');
  filterBtns.forEach(btn => {
    const cat = btn.getAttribute('data-category');
    if (cat === 'todos') return;
    const count = categoryCounts[cat] || 0;
    if (count > 0) {
      btn.innerHTML = `${btn.textContent.trim().split(' ')[0]} <span class="filter-count">${count}</span>`;
    }
  });
}

/**
 * Renderiza el catálogo principal de productos aplicando filtros y ordenamiento
 */
function renderCatalog(categoryFilter) {
  const productsGrid = document.getElementById('products-catalog-grid');
  if (!productsGrid) return;
  
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

  // Aplicar ordenamiento
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

  // Si no hay resultados
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
      const catalogSearchInput = document.getElementById('catalog-search-input');
      const clearSearchBtn = document.getElementById('clear-search-btn');
      
      if (catalogSearchInput) catalogSearchInput.value = '';
      currentSearchQuery = '';
      if (clearSearchBtn) clearSearchBtn.style.display = 'none';
      
      const filterButtons = document.querySelectorAll('.filter-btn');
      filterButtons.forEach(b => b.classList.remove('active'));
      const allBtn = document.getElementById('filter-btn-all');
      if (allBtn) allBtn.classList.add('active');
      
      renderCatalog('todos');
      if (catalogSearchInput) catalogSearchInput.focus();
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

    let discountHTML = '';
    if (prod.originalPrice && prod.price && prod.originalPrice > prod.price) {
      const pct = Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100);
      discountHTML = `<div class="product-discount-tag">-${pct}% OFF</div>`;
    }

    const isConsultar = !prod.price || prod.price === 0;

    let transferPriceHTML = '';
    if (!isConsultar) {
      const transferPrice = Math.round(prod.price * 0.9);
      transferPriceHTML = `<div class="product-transfer-price">$${transferPrice.toLocaleString('es-AR')} con 10% OFF en efectivo o transferencia</div>`;
    }

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

    card.addEventListener('click', (e) => {
      if (!e.target.closest('.add-to-cart-btn')) {
        openProductDetail(prod.id);
      }
    });

    productsGrid.appendChild(card);
  });

  // Agregar eventos a botones comprar
  const addButtons = productsGrid.querySelectorAll('.add-to-cart-btn');
  addButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-id');
      addToCart(id);
      
      btn.style.transform = 'scale(0.85)';
      setTimeout(() => {
        btn.style.transform = '';
      }, 150);
    });
  });

  // Animación suave con Intersection Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
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
