/* ==========================================================================
   UNIVERCELU - SERVICIO DE CARRITO DE COMPRAS (cart-service.js)
   ========================================================================== */

/**
 * Agrega un producto seleccionado al carrito, manejando incrementos o nuevas inserciones
 */
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
  
  // Abrir modal de forma automática
  openCart();
}

/**
 * Incrementa o decrementa la cantidad de un artículo directamente en el carrito
 */
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

/**
 * Remueve por completo un producto del carrito
 */
function removeFromCart(productId) {
  carrito = carrito.filter(i => i.id !== productId);
  saveCart();
  updateCartUI();
}

/**
 * Guarda en almacenamiento persistente el estado actual del carrito
 */
function saveCart() {
  localStorage.setItem('univercelu_cart', JSON.stringify(carrito));
}

/**
 * Renderiza la interfaz gráfica del carrito de compras y recalcula totales
 */
function updateCartUI() {
  const cartItemsBody = document.getElementById('cart-items-body');
  const checkoutWspBtn = document.getElementById('checkout-whatsapp-btn');
  const clearCartBtn = document.getElementById('clear-cart-btn');
  const cartCounter = document.getElementById('cart-counter');
  const cartSummaryQty = document.getElementById('cart-summary-qty');
  const cartSummaryTotal = document.getElementById('cart-summary-total');

  if (!cartItemsBody) return;

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
    if (checkoutWspBtn) {
      checkoutWspBtn.style.opacity = '0.5';
      checkoutWspBtn.style.pointerEvents = 'none';
    }
    if (clearCartBtn) clearCartBtn.style.display = 'none';
  } else {
    if (checkoutWspBtn) {
      checkoutWspBtn.style.opacity = '1';
      checkoutWspBtn.style.pointerEvents = 'all';
    }
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

    // Eventos de botones
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

  // Totales y contadores
  if (cartCounter) cartCounter.textContent = totalArticulos;
  if (cartSummaryQty) cartSummaryQty.textContent = totalArticulos;

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
  if (cartSummaryTotal) cartSummaryTotal.textContent = totalDisplay;
}

/**
 * Da formato al pedido y abre el chat de WhatsApp del vendedor para completar el pedido
 */
function enviarPedidoWhatsApp() {
  const customerNameInput = document.getElementById('customer-name-input');
  const nameModal = document.getElementById('name-modal');
  const nameModalOverlay = document.getElementById('name-modal-overlay');

  const nombre = customerNameInput ? customerNameInput.value.trim() : '';

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

  if (nameModal) nameModal.classList.remove('open');
  if (nameModalOverlay) nameModalOverlay.classList.remove('open');
  document.body.style.overflow = '';

  const encodedMessage = encodeURIComponent(mensaje);
  const wspURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
  window.open(wspURL, '_blank');

  // Notificación toast premium de envío
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
