// Univercelu 3D Interactive Phone Experience
// Built procedurally in Three.js (No heavy external GLB assets, lightweight, responsive, WebGL Fallback)

(function () {
  // 1. Detección de Soporte WebGL
  function detectWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  const container = document.getElementById('phone-3d-container');
  const fallback = document.getElementById('hero-fallback-wrapper');

  if (!container || !fallback) return;

  // Si no hay soporte WebGL o el dispositivo es muy limitado, mantenemos el fallback
  if (!detectWebGL() || typeof THREE === 'undefined') {
    console.log('[3D] WebGL no soportado o librería Three.js ausente. Usando fallback estático.');
    return;
  }

  console.log('[3D] Inicializando renderizador WebGL procedural...');

  // --- Inicialización de Three.js ---
  let scene, camera, renderer;
  let phoneGroup;
  let layerScreen, layerBoard, layerBack;
  let width, height;

  // Variables de Interacción
  let isExploded = false;
  let targetExplode = 0; // 0 = cerrado, 1 = abierto
  let currentExplode = 0;

  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let targetRotation = { x: 0.1, y: -0.3 };
  let currentRotation = { x: 0.1, y: -0.3 };
  let rotationVelocity = { x: 0, y: 0 };
  
  const LERP_FACTOR = 0.08;
  const DRAG_DAMPING = 0.92;

  function init() {
    width = container.clientWidth || 450;
    height = container.clientHeight || 450;

    // Escena
    scene = new THREE.Scene();

    // Cámara
    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.z = 12;

    // Renderizador
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false; // Optimización de FPS
    container.appendChild(renderer.domElement);

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x7c3aed, 0.6); // Luz lila lateral
    dirLight2.position.set(-5, -2, 2);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xa855f7, 1.2, 10);
    pointLight.position.set(0, 0, 2);
    scene.add(pointLight);

    // Contenedor del Celular
    phoneGroup = new THREE.Group();
    scene.add(phoneGroup);

    // --- Construcción Procedural del Smartphone ---
    buildSmartphone();

    // Eventos
    setupEventListeners();

    // Activar el contenedor y ocultar el fallback
    fallback.style.display = 'none';
    container.style.display = 'block';
    setTimeout(() => {
      container.style.opacity = '1';
    }, 50);

    // Animación
    animate();
  }

  // --- Generación de Texturas Procedurales en 2D Canvas ---
  
  function createScreenTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Gradiente galáctico oscuro
    const grad = ctx.createLinearGradient(0, 0, 0, 1024);
    grad.addColorStop(0, '#0b001a');
    grad.addColorStop(0.5, '#210f4d');
    grad.addColorStop(1, '#050010');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 1024);

    // Nebulosa sutil en fondo de pantalla
    ctx.globalCompositeOperation = 'screen';
    const radGrad = ctx.createRadialGradient(256, 512, 0, 256, 512, 350);
    radGrad.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(256, 512, 350, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // Líneas de órbita decorativas
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(256, 512, 210, 0, Math.PI * 2);
    ctx.stroke();

    // Texto de la Marca
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 64px Outfit, Inter, Arial';
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#a855f7';
    ctx.fillText('UNIVERCE', 256, 460);

    ctx.font = 'bold 54px Outfit, Inter, Arial';
    ctx.fillStyle = '#00f2fe';
    ctx.shadowColor = '#00f2fe';
    ctx.fillText('CELU', 256, 525);

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(226, 217, 243, 0.85)';
    ctx.font = '500 24px Inter, Arial';
    ctx.fillText('Servicio Técnico & Accesorios', 256, 595);

    // Barra de Estado Superior
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = 'bold 22px Inter, Arial';
    ctx.fillText('09:30', 80, 50);
    ctx.fillText('📶 🔋 98%', 420, 50);

    // Icono Central de Herramientas
    ctx.fillStyle = '#a855f7';
    ctx.font = '40px FontAwesome, Arial';
    ctx.fillText('🛠️', 256, 360);

    return new THREE.CanvasTexture(canvas);
  }

  function createBoardTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Placa verde/gris oscuro
    ctx.fillStyle = '#0d151c';
    ctx.fillRect(0, 0, 512, 1024);

    // Dibujar trazas del circuito integradas (Cian fluorescente)
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 5;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f2fe';

    const paths = [
      [[100, 100], [200, 200], [200, 400], [150, 450]],
      [[412, 100], [312, 200], [312, 350], [362, 400]],
      [[100, 800], [256, 600], [256, 500]],
      [[412, 800], [350, 750], [350, 600]]
    ];

    paths.forEach(p => {
      ctx.beginPath();
      ctx.moveTo(p[0][0], p[0][1]);
      for (let i = 1; i < p.length; i++) {
        ctx.lineTo(p[i][0], p[i][1]);
      }
      ctx.stroke();
    });

    // Puntos de soldadura
    ctx.fillStyle = '#ff007f';
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 8;
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 412 + 50, Math.random() * 850 + 100, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
  }

  // --- Modelado de Capas ---
  
  function buildSmartphone() {
    const phoneWidth = 3.2;
    const phoneHeight = 6.4;
    const thickness = 0.08;

    // --- CAPA 1: PANTALLA FRONTAL (Glass + UI Canvas) ---
    layerScreen = new THREE.Group();
    layerScreen.position.z = 0.4; // Desplazamiento inicial cerrado
    phoneGroup.add(layerScreen);

    // Vidrio externo transparente (Physical Material de alta calidad)
    const glassGeo = new THREE.BoxGeometry(phoneWidth, phoneHeight, 0.03);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.7,
      thickness: 0.25,
      transparent: true,
      opacity: 0.95
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    layerScreen.add(glassMesh);

    // Plano del Display (Bajo el vidrio)
    const displayGeo = new THREE.PlaneGeometry(phoneWidth - 0.12, phoneHeight - 0.12);
    const displayMat = new THREE.MeshBasicMaterial({
      map: createScreenTexture(),
      transparent: true
    });
    const displayMesh = new THREE.Mesh(displayGeo, displayMat);
    displayMesh.position.z = 0.016; // Justo en la superficie del cristal
    layerScreen.add(displayMesh);

    // --- CAPA 2: PLACA BASE (Motherboard + Chips + Batería) ---
    layerBoard = new THREE.Group();
    layerBoard.position.z = 0.0;
    phoneGroup.add(layerBoard);

    // Placa verde/negra
    const boardGeo = new THREE.BoxGeometry(phoneWidth - 0.15, phoneHeight - 0.15, 0.04);
    const boardMat = new THREE.MeshStandardMaterial({
      map: createBoardTexture(),
      roughness: 0.7,
      metalness: 0.2
    });
    const boardMesh = new THREE.Mesh(boardGeo, boardMat);
    layerBoard.add(boardMesh);

    // Batería Metálica
    const batteryGeo = new THREE.BoxGeometry(phoneWidth * 0.45, phoneHeight * 0.45, 0.08);
    const batteryMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.9,
      roughness: 0.15
    });
    const batteryMesh = new THREE.Mesh(batteryGeo, batteryMat);
    batteryMesh.position.set(-phoneWidth * 0.12, -phoneHeight * 0.08, 0.05);
    layerBoard.add(batteryMesh);

    // Procesador (Golden Chip)
    const cpuGeo = new THREE.BoxGeometry(0.7, 0.7, 0.06);
    const cpuMat = new THREE.MeshStandardMaterial({
      color: 0xffd700, // Oro
      metalness: 0.8,
      roughness: 0.3
    });
    const cpuMesh = new THREE.Mesh(cpuGeo, cpuMat);
    cpuMesh.position.set(phoneWidth * 0.18, phoneHeight * 0.18, 0.05);
    layerBoard.add(cpuMesh);

    // --- CAPA 3: CHASIS & CÁMARAS TRASERAS (Back Cover) ---
    layerBack = new THREE.Group();
    layerBack.position.z = -0.4;
    phoneGroup.add(layerBack);

    // Carcasa trasera lila metalizado brillante
    const backGeo = new THREE.BoxGeometry(phoneWidth, phoneHeight, thickness);
    const backMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed, // Lila de la marca (#7C3AED)
      metalness: 0.8,
      roughness: 0.35
    });
    const backMesh = new THREE.Mesh(backGeo, backMat);
    layerBack.add(backMesh);

    // Módulo de Cámaras (Relieve rectangular redondeado)
    const camModuleGeo = new THREE.BoxGeometry(1.1, 1.8, 0.12);
    const camModuleMat = new THREE.MeshStandardMaterial({
      color: 0x1d152d, // Violeta muy oscuro brillante
      metalness: 0.6,
      roughness: 0.2
    });
    const camModuleMesh = new THREE.Mesh(camModuleGeo, camModuleMat);
    camModuleMesh.position.set(-phoneWidth * 0.22, phoneHeight * 0.28, -thickness - 0.02);
    layerBack.add(camModuleMesh);

    // 3 Lentes de Cámara (Cilindros reflectantes con cristales)
    const lensGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.08, 16);
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0x111111,
      roughness: 0.02,
      metalness: 0.9,
      transmission: 0.3,
      thickness: 0.1,
      transparent: true
    });

    for (let i = 0; i < 3; i++) {
      const lensMesh = new THREE.Mesh(lensGeo, lensMat);
      lensMesh.rotation.x = Math.PI / 2;
      lensMesh.position.set(
        -phoneWidth * 0.22, 
        phoneHeight * 0.28 + (0.42 - i * 0.42), 
        -thickness - 0.08
      );
      layerBack.add(lensMesh);
    }
  }

  // --- Controladores de Eventos (Arrastre y Explode) ---
  
  function setupEventListeners() {
    // Escuchar hover para explosión del despiece
    container.addEventListener('mouseenter', () => {
      isExploded = true;
      targetExplode = 1;
      updateHtmlLabelsVisibility(true);
    });

    container.addEventListener('mouseleave', () => {
      isExploded = false;
      targetExplode = 0;
      updateHtmlLabelsVisibility(false);
      isDragging = false;
    });

    // Soporte para toques en móvil (Alterna Explode)
    container.addEventListener('touchstart', (e) => {
      isExploded = !isExploded;
      targetExplode = isExploded ? 1 : 0;
      updateHtmlLabelsVisibility(isExploded);
      
      // Inicializar arrastre táctil
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;

        targetRotation.y += deltaX * 0.007;
        targetRotation.x += deltaY * 0.007;

        // Limitar rotación X para evitar voltear de cabeza
        targetRotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotation.x));

        previousMousePosition = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }
    }, { passive: true });

    container.addEventListener('touchend', () => {
      isDragging = false;
    }, { passive: true });

    // Drag-to-Rotate con el Mouse (Desktop)
    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMousePosition = {
        x: e.clientX,
        y: e.clientY
      };
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        targetRotation.y += deltaX * 0.005;
        targetRotation.x += deltaY * 0.005;

        // Limitar rotación X
        targetRotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotation.x));

        previousMousePosition = {
          x: e.clientX,
          y: e.clientY
        };
      }
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Responsividad del Canvas
    window.addEventListener('resize', onWindowResize);
  }

  function onWindowResize() {
    width = container.clientWidth || 450;
    height = container.clientHeight || 450;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  }

  // --- Lógica del HTML Fallback Labels ---
  // Mostramos las etiquetas originales flotantes cuando se abre el celular en 3D
  function updateHtmlLabelsVisibility(show) {
    // Buscamos las etiquetas flotantes en la página
    const labels = document.querySelectorAll('.layer-label');
    const hint = document.querySelector('.hover-hint');

    labels.forEach(label => {
      if (show) {
        label.classList.add('visible-3d-mode');
      } else {
        label.classList.remove('visible-3d-mode');
      }
    });

    if (hint) {
      if (show) {
        hint.style.opacity = '0';
      } else {
        hint.style.opacity = '1';
      }
    }
  }

  // --- Loop de Animación (Render) ---
  
  function animate() {
    requestAnimationFrame(animate);

    const time = Date.now();

    // 1. Suavizado (Lerp) para la animación de Despiece (Explosion)
    currentExplode += (targetExplode - currentExplode) * LERP_FACTOR;

    // Reposicionar capas según el nivel de despiece
    layerScreen.position.z = 0.45 + currentExplode * 1.5;  // Módulo de Pantalla vuela adelante
    layerBack.position.z = -0.45 - currentExplode * 1.5;  // Chasis trasero vuela atrás
    // La placa base se mantiene flotando en el medio
    
    // 2. Rotación Orbital por Arrastre (Lerp)
    if (!isDragging) {
      // Auto-rotación lenta cuando el usuario no arrastra
      targetRotation.y += 0.0035;
      
      // Auto-flotación vertical en reposo
      phoneGroup.position.y = Math.sin(time * 0.0015) * 0.16;
    } else {
      phoneGroup.position.y += (0 - phoneGroup.position.y) * LERP_FACTOR;
    }

    currentRotation.y += (targetRotation.y - currentRotation.y) * LERP_FACTOR;
    currentRotation.x += (targetRotation.x - currentRotation.x) * LERP_FACTOR;

    phoneGroup.rotation.y = currentRotation.y;
    phoneGroup.rotation.x = currentRotation.x;

    // Renderizado de Escena
    renderer.render(scene, camera);
  }

  // Ejecutar inicialización al cargar Three.js
  init();
})();
