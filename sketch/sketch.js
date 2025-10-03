// ------------------------- Estado Global -------------------------
let appState = {
  cartasDesbloqueadas: [],
  rarezas: {},
  expansiones: {},
  progreso: {},
  cualquierDatoExtra: {}
};

// ------------------------- Guardar Estado -------------------------
function guardarEstado() {
  localStorage.setItem("appState", JSON.stringify(appState));
}

// ------------------------- Cargar Estado -------------------------
function cargarEstado() {
  const data = localStorage.getItem("appState");
  if (data) {
    appState = JSON.parse(data);
  }
}

// ------------------------- Aplicar Estado al DOM -------------------------
function aplicarEstado() {
  // Restaurar cartas desbloqueadas
  appState.cartasDesbloqueadas.forEach(passId => {
    const carta = document.querySelector(`.carta-wrapper[data-pass="${passId}"],
                                          .carta-wrapper[data-auto="${passId}"],
                                          .carta-wrapper[data-requisito="${passId}"]`);
    if (carta) {
      const overlay = carta.querySelector(".overlay-bloqueo");
      if (overlay) overlay.remove();
    }
  });

  // Restaurar contador o progreso extra
  if (appState.progreso.contador) {
    const cont = document.getElementById("contador");
    if (cont) cont.textContent = appState.progreso.contador;
  }
}

// ------------------------- Funciones de progreso -------------------------
function desbloquearCarta(pass) {
  if (!appState.cartasDesbloqueadas.includes(pass)) {
    appState.cartasDesbloqueadas.push(pass);
    guardarEstado();
  }
}

function sumarContador() {
  if (!appState.progreso.contador) appState.progreso.contador = 0;
  appState.progreso.contador++;
  const cont = document.getElementById("contador");
  if (cont) cont.textContent = appState.progreso.contador;
  guardarEstado();
}

// ------------------------- Inicialización -------------------------
document.addEventListener("DOMContentLoaded", () => {
  cargarEstado();
  aplicarEstado();

  chequearDesbloqueosAutomaticos();
  chequearDesbloqueosPorCantidadORareza();
});

// ------------------------- Galería de cartas -------------------------
function mostrarGaleria() {
  document.getElementById('galeriaContainer').style.display = 'block';
}
function cerrarGaleria() {
  document.getElementById('galeriaContainer').style.display = 'none';
}

function mostrarQuees() {
  document.getElementById('queesContainer').style.display = 'block';
}
function cerrarQuees() {
  document.getElementById('queesContainer').style.display = 'none';
}

// ------------------------- Noticias -------------------------
function mostrarNoticias() {
  document.getElementById('noticiasContainer').style.display = 'block';
}
function cerrarNoticias() {
  document.getElementById('noticiasContainer').style.display = 'none';
  localStorage.setItem("noticiasVistas", "true");
}

// ------------------------- Mostrar noticias al abrir la app -------------------------
window.addEventListener("load", () => {
  const esPWA = window.matchMedia('(display-mode: standalone)').matches 
                || window.navigator.standalone === true;
  if (esPWA && !localStorage.getItem("noticiasVistas")) {
    mostrarNoticias();
  }
});

// ------------------------- Escáner QR -------------------------
let scanner;
const btnAbrir = document.getElementById("btn-abrir-escaner");
const overlay = document.getElementById("overlay");
const cerrar = document.getElementById("cerrar-overlay");
const resultado = document.getElementById("resultado");

btnAbrir.addEventListener("click", () => {
  overlay.style.display = "flex";
  if (!scanner) scanner = new Html5Qrcode("reader");
  scanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      resultado.innerText = "Código QR: " + decodedText;
      document.getElementById("codigoGlobal").value = decodedText;
      document.getElementById("botonVerificarCodigo").click();
      scanner.stop().then(() => overlay.style.display = "none");
    }
  ).catch(err => console.error("No se pudo iniciar el escáner:", err));
});

cerrar.addEventListener("click", () => {
  if (scanner) {
    scanner.stop().then(() => {
      overlay.style.display = "none";
      resultado.innerText = "";
    }).catch(() => overlay.style.display = "none");
  } else {
    overlay.style.display = "none";
  }
});

// ------------------------- Botón Expansiones -------------------------
function abrirVentanaExpansiones() {
  document.getElementById("ventanaExpansiones").style.display = "flex";
}
function cerrarVentanaExpansiones() {
  document.getElementById("ventanaExpansiones").style.display = "none";
}

// ------------------------- Carrusel de expansiones -------------------------
let indiceCarruseldeExpansiones = 0;
function moverCarruseldeExpansiones(direccion) {
  const carrusel = document.querySelector('.carruseldeexpansiones');
  const totalItems = document.querySelectorAll('.carruseldeexpansiones-item').length;
  indiceCarruseldeExpansiones += direccion;
  if (indiceCarruseldeExpansiones < 0) indiceCarruseldeExpansiones = totalItems - 1;
  if (indiceCarruseldeExpansiones >= totalItems) indiceCarruseldeExpansiones = 0;
  carrusel.style.transform = `translateX(-${indiceCarruseldeExpansiones * 100}%)`;
}

function mostrarExpansion(numero) {
  const expansiones = document.querySelectorAll('.cartasgaleriacontainer');
  expansiones.forEach(expansion => {
    if (expansion.getAttribute('data-expansion') === numero) {
      expansion.style.display = 'block';
    } else {
      expansion.style.display = 'none';
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  mostrarExpansion("1");
});


  // Bloquear zoom global
  document.addEventListener('gesturestart', e => e.preventDefault());
  let lastTouchEnd = 0;
  document.addEventListener('touchend', event => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) event.preventDefault();
    lastTouchEnd = now;
  }, false);
  document.addEventListener('touchstart', event => {
    if (event.touches.length > 1) event.preventDefault();
  }, { passive: false });

  // Pantalla negra
  function mostrarPantallaNegra() {
    const pantallaNegra = document.getElementById('pantallaNegra');
    if (pantallaNegra) {
      pantallaNegra.classList.add('activo');
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }
  }
  function ocultarPantallaNegra() {
    const pantallaNegra = document.getElementById('pantallaNegra');
    if (pantallaNegra) {
      pantallaNegra.classList.remove('activo');
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    }
  }

  // Alertas personalizadas
  function mostrarAlerta(mensaje, tipo) {
    const modal = document.getElementById("alertaModal");
    const texto = document.getElementById("textoAlerta");
    const contenido = document.querySelector(".contenido-alerta");
    if (modal && texto && contenido) {
      texto.textContent = mensaje;
      const colores = {
        canjeado: { fondo: "rgba(240, 196, 1, 1)", borde: "#ff5c5c" },
        incorrecto: { fondo: "#ff5c5c", borde: "#000" }
      };
      if (colores[tipo]) {
        contenido.style.backgroundColor = colores[tipo].fondo;
        contenido.style.borderColor = colores[tipo].borde;
      }
      modal.classList.remove("oculto");
      document.body.style.overflow = "hidden";
    }
  }
  window.cerrarAlerta = () => {
    document.getElementById("alertaModal")?.classList.add("oculto");
    document.body.style.overflow = "auto";
  };
  document.addEventListener("keydown", e => {
    if (e.key === "Enter" && !document.getElementById("alertaModal")?.classList.contains("oculto")) {
      cerrarAlerta();
    }
  });

  // Bloqueo de cartas
  document.querySelectorAll(".tarjeta").forEach(t => t.classList.add("flip"));
  const carouselItems = document.querySelectorAll(".carousel-item");
  const fondonegro = document.querySelector(".fondonegro");
  document.getElementById("codigoGlobal").addEventListener("keypress", e => {
    if (e.key === "Enter") document.getElementById("botonVerificarCodigo").click();
  });
  carouselItems.forEach(item => item.style.display = "none");
  fondonegro.style.display = "none";

  // Cartel amarillo y requisitos activos
  let cartelActivo = null;
  let requisitosActivos = [];
  document.getElementById("botonVerificarCodigo").addEventListener("click", () => {
    const codigo = document.getElementById("codigoGlobal").value.trim();
    if (!codigo) return;
    let encontrado = false;
    let desbloqueada = false;
    document.querySelectorAll(".carta-wrapper").forEach(wrapper => {
      const overlay = wrapper.querySelector(".overlay-bloqueo");
      const pass = wrapper.getAttribute("data-pass");
      if (codigo.toLowerCase() === pass.toLowerCase()) {
        encontrado = true;
        if (overlay) {
          overlay.remove();

             // 🔥 Cambiar a la expansión del contenedor padre
    const contenedor = wrapper.closest(".cartasgaleriacontainer");
    if (contenedor) {
      const expansionNum = contenedor.getAttribute("data-expansion");
      if (expansionNum) {
        mostrarExpansion(expansionNum);
      }
    }

          desbloqueada = true;
          const boton = wrapper.querySelector(".cartaejemplo");
          const id = boton?.getAttribute("data-target");
          const item = document.getElementById(id);
          if (item) {
            carouselItems.forEach(i => i.style.display = "none");
            item.style.display = "flex";
            fondonegro.style.display = "block";
            document.body.style.overflow = "hidden";
            mostrarPantallaNegra();
            setTimeout(() => {
              ocultarPantallaNegra();
              if (!item.dataset.animado) {
                item.classList.add("animacion-primera-vez");
                item.dataset.animado = "true";
                setTimeout(() => item.classList.remove("animacion-primera-vez"), 3000);
              }
            }, 2000);
            setTimeout(() => wrapper.scrollIntoView({ behavior: "smooth", block: "center" }), 2500);
            setTimeout(chequearDesbloqueosAutomaticos, 0);
          }
        }
      }
    });
    if (!encontrado) mostrarAlerta("CÓDIGO INCORRECTO", "incorrecto");
    else if (!desbloqueada) mostrarAlerta("CÓDIGO YA INGRESADO", "canjeado");
    document.getElementById("codigoGlobal").value = "";
  });

// Abrir cartas desbloqueadas
document.querySelectorAll(".cartaejemplo").forEach(boton => {
  boton.addEventListener("click", e => {
    e.stopPropagation();

    const wrapper = boton.closest(".carta-wrapper");
    if (!wrapper.querySelector(".overlay-bloqueo")) {

      const id = boton.getAttribute("data-target");
      const item = document.getElementById(id);
      if (item) {
        carouselItems.forEach(i => i.style.display = "none");
        item.style.display = "flex";
        fondonegro.style.display = "block";
        document.body.style.overflow = "hidden";

        // Overlay de carga para legendarias
        if (item.classList.contains("Clegendario") && !item.dataset.cargaMostrada) {
          item.dataset.cargaMostrada = "true";

          const tarjeta = item.querySelector(".tarjeta");
          const overlayCarta = document.createElement("div");
          overlayCarta.className = "overlay-revelado";

          tarjeta.appendChild(overlayCarta);

          setTimeout(() => {
            // opcional: animación fade-out
            overlayCarta.classList.add("fade-out");
            setTimeout(() => overlayCarta.remove(), 800); // espera fade-out
          }, 1300);
        }
      }

    }
  });
});


  // Cerrar carrusel
  const cerrarCarrusel = () => {
    carouselItems.forEach(item => {
      item.style.display = "none";
      const qr = item.querySelector(".codigoqrdecarta");
      if (qr) qr.style.display = "none";
    });
    fondonegro.style.display = "none";
    document.body.style.overflow = "auto";
  };
  document.querySelectorAll('.botonatras').forEach(boton => {
    if (boton.textContent.trim() === "X") {
      boton.addEventListener('click', (e) => {
        e.stopPropagation();
        cerrarCarrusel();
      });
    }
  });
// Cartel amarillo con requisitos
document.querySelectorAll('.overlay-bloqueo.overespecial').forEach(overlay => {
  overlay.addEventListener('click', e => {
    e.stopPropagation();
    const mensajePersonalizado = overlay.getAttribute('data-cartel');
    const requisitos = overlay.getAttribute('data-requiere');
    let contenidoFinal = '';
    if (mensajePersonalizado) {
      contenidoFinal += `<p>${mensajePersonalizado}</p>`;
      if (requisitos) contenidoFinal += generarContenidoCartel(JSON.parse(requisitos));
    } else if (requisitos) {
      contenidoFinal = generarContenidoCartel(JSON.parse(requisitos));
    } else {
      contenidoFinal = "<p>⚠ Carta bloqueada.</p>";
    }
    mostrarCartelEnOverlay(contenidoFinal);
  });
});

// Genera el HTML de las cartas requeridas con su estado
function generarContenidoCartel(listaIds) {
  let html = "<div class='cartas-requeridas'>";
  listaIds.forEach(passId => {
    const cartaWrapper = document.querySelector(`.carta-wrapper[data-pass="${passId}"]`);
    if (cartaWrapper) {
      const boton = cartaWrapper.querySelector('.cartaejemplo');
      const fondo = boton?.getAttribute('data-style') || "";
      const bloqueada = cartaWrapper.querySelector('.overlay-bloqueo') ? true : false;
      html += `<div class="carta-mini" style="${fondo}">${bloqueada ? "<div class='mini-overlay'></div>" : ""}</div>`;
    }
  });
  html += "</div>";
  return html;
}

// Mostrar cartel dentro de un overlay negro
function mostrarCartelEnOverlay(htmlContenido) {
  const overlayFondo = document.createElement('div');
  overlayFondo.className = 'overlay-fondo';
  const cartel = document.createElement('div');
  cartel.className = 'cartel-advertencia';
  cartel.innerHTML = `${htmlContenido}<button class="btn-cerrar-cartel">OK</button>`;
  overlayFondo.appendChild(cartel);
  document.body.appendChild(overlayFondo);
  cartel.querySelector('.btn-cerrar-cartel').addEventListener('click', () => overlayFondo.remove());
}

function mostrarAlertaDesbloqueo() {


// crear el flash de luz
const flash = document.createElement('div');
flash.className = 'flash-luz';
document.body.appendChild(flash);

// activar flash
setTimeout(() => {
  flash.classList.add('visible');
}, 50);

// limpiar flash
setTimeout(() => {
  flash.remove();
}, 1000);



  // fondo
  const fondo = document.createElement('div');
  fondo.className = 'fondoexplosion';
  document.body.appendChild(fondo);

  // parámetros
  const NUM_ESTRELLAS = 30;
  const stars = [];

  // punto inicial (pegado al ángulo superior derecho)
  const marginRight = 8;
  const startXBase = window.innerWidth - marginRight; // x en px (derecha)
  const startYBase = 8; // y en px (desde arriba)

  // crear estrellas
  for (let i = 0; i < NUM_ESTRELLAS; i++) {
    const star = document.createElement('div');
    star.className = 'estrella';

    // tamaño aleatorio
    const size = 3 + Math.random() * 10; // 
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `0px`;
    star.style.top = `0px`;

    // cola
    const cola = document.createElement('div');
    cola.className = 'cola';
    star.appendChild(cola);

    // posición inicial con un poco de jitter
    const jitterX = - (Math.random() * 12); // hacia la izquierda un poco
    const jitterY = Math.random() * 8 - 4;  // +/- 4px vertical

    const startX = startXBase + jitterX - size + 150; // +100px a la derecha
const startY = startYBase + jitterY - 50;

    // velocidades iniciales (px/s)
    const vx = - (120 + Math.random() * 380);     // siempre hacia la izquierda
    const vy = -20 + Math.random() * 180;         // pequeño "lanzamiento" vertical

    const ttl = 1.2 + Math.random() * 1.6; // duración de vida

    // guardar objeto, sin aceleración lateral
    stars.push({
      el: star,
      cola,
      x: startX,
      y: startY,
      vx,
      vy,
      ax: 0, // sin curva
      size,
      ttl,
      born: performance.now()
    });

    // poner elemento en DOM
    fondo.appendChild(star);
  }

  // animación por frames
  let last = performance.now();
  function raf(now) {
    const dt = Math.min(0.04, (now - last) / 1000);
    last = now;

    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i];
      const age = (now - s.born) / 1000;

      // si expiró o salió demasiado fuera, eliminar
      if (age > s.ttl || s.y > window.innerHeight + 300 || s.x < -300) {
        s.el.remove();
        stars.splice(i, 1);
        continue;
      }

      // física: solo gravedad, sin curva
      const gravity = 600;
      s.vx += 0;        // sin oscilación
      s.vy += gravity * dt;

      // integrar posición
      s.x += s.vx * dt;
      s.y += s.vy * dt;

      // estilo
      const lifeRatio = Math.max(0, Math.min(1, age / s.ttl));
      const scale = 1 - lifeRatio * 1;
      s.el.style.transform = `translate(${s.x}px, ${s.y}px) scale(${scale})`;
 s.el.style.opacity = `${Math.max(0, 1 - lifeRatio * 1)}`;


      // cola
      const speed = Math.hypot(s.vx, s.vy);
      const tailLen = Math.min(140, speed * 0.11 + s.size * 1.5);
      const angleRad = Math.atan2(s.vy, s.vx);
      const tailAngleDeg = angleRad * 180 / Math.PI + 180;

      s.cola.style.width = `${tailLen}px`;
      s.cola.style.height = `${Math.max(1, Math.round(s.size / 5))}px`;
      s.cola.style.opacity = `${Math.max(0, 1 - lifeRatio * 2)}`;

      s.cola.style.transform = `translate(0%, -50%) rotate(${tailAngleDeg}deg)`;
    }

    if (stars.length > 0) requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Crear la alerta
  const alerta = document.createElement('div');
  alerta.className = 'alerta-desbloqueo';
  alerta.innerHTML = `
    <span class="mensaje">¡CARTA LEGENDARIA DESBLOQUEADA!</span>
    <div class="circulo-imagen"><img src="../assets/icon-192.png" alt="Carta"></div>
  `;
  document.body.appendChild(alerta);

  // aparecer
  setTimeout(() => {
    fondo.classList.add('visible');
    alerta.classList.add('visible');
  }, 50);

  // limpiar después
  setTimeout(() => {
    alerta.classList.remove('visible');
    fondo.classList.remove('visible');
    setTimeout(() => {
      alerta.remove();
      fondo.remove();
    }, 1000);
  }, 5000);
}



// Desbloqueo por cantidad O por rareza específica (separado por expansión)
function chequearDesbloqueosPorCantidadORareza() {
  document.querySelectorAll('.cartasgaleriacontainer').forEach(expansion => {
// Cantidad de cartas desbloqueadas dentro de la expansión
const todasCartas = Array.from(expansion.querySelectorAll('.carta-wrapper'))
  .filter(wrapper => {
    const boton = wrapper.querySelector('.cartaejemplo');
    // Excluye las legendarias (oro)
    return boton && !boton.classList.contains('oro');
  });

const desbloqueadas = todasCartas.filter(wrapper => !wrapper.querySelector('.overlay-bloqueo')).length;


    // Conteo de rarezas por expansión
    const normalesTotal = expansion.querySelectorAll('.carta-wrapper .cartaejemplo.comun').length;
    const rarasTotal = expansion.querySelectorAll('.carta-wrapper .cartaejemplo.plata').length;
    const normalesBloqueadas = expansion.querySelectorAll('.overlay-bloqueo.overnormal').length;
    const rarasBloqueadas = expansion.querySelectorAll('.overlay-bloqueo.overraro').length;

    const normalesDesbloqueadas = normalesTotal - normalesBloqueadas;
    const rarasDesbloqueadas = rarasTotal - rarasBloqueadas;

    // Recorremos cartas que piden cantidad o rareza dentro de la expansión
    expansion.querySelectorAll('.carta-wrapper[data-requiere-cantidad], .carta-wrapper[data-requiere-rareza]').forEach(wrapper => {
      const overlay = wrapper.querySelector('.overlay-bloqueo');
      if (!overlay) return;

      // Desbloqueo por cantidad
      if (wrapper.hasAttribute('data-requiere-cantidad')) {
        const cantidadNecesaria = parseInt(wrapper.getAttribute('data-requiere-cantidad'), 10);
        if (desbloqueadas >= cantidadNecesaria) {
          overlay.remove();
          setTimeout(() => mostrarAlertaDesbloqueo(), 3000);
        }
      }

      // Desbloqueo por rareza
      if (wrapper.hasAttribute('data-requiere-rareza')) {
        const rarezas = wrapper.getAttribute('data-requiere-rareza').split(',');
        let desbloquear = true;
        rarezas.forEach(r => {
          if (r === "normal" && normalesDesbloqueadas !== normalesTotal) desbloquear = false;
          if (r === "raro" && rarasDesbloqueadas !== rarasTotal) desbloquear = false;
        });
        if (desbloquear) {
          overlay.remove();
          setTimeout(() => mostrarAlertaDesbloqueo(), 3000);
        }
      }
    });
  });
}

// Chequea y desbloquea cartas automáticamente según requisitos
function chequearDesbloqueosAutomaticos() {
  const cartasBloqueadas = document.querySelectorAll('.carta-wrapper .overlay-bloqueo.overespecial, .carta-wrapper .overlay-bloqueo.overraro');
  let cambios = false;
  cartasBloqueadas.forEach(overlay => {
    const wrapper = overlay.closest('.carta-wrapper');
    if (!wrapper) return;
    const requiere = overlay.getAttribute('data-requiere');
    if (!requiere) return;
    const requisitos = JSON.parse(requiere);
    const todasDesbloqueadas = requisitos.every(id => {
      const cartaReq = document.querySelector(`.carta-wrapper[data-pass="${id}"]`);
      return cartaReq && !cartaReq.querySelector('.overlay-bloqueo');
    });
    if (todasDesbloqueadas) {
      overlay.remove();
      cambios = true;
      setTimeout(() => mostrarAlertaDesbloqueo(), 3000);
    }
  });
  if (cambios) chequearDesbloqueosAutomaticos();

  // ahora chequeamos cantidad y rarezas
  chequearDesbloqueosPorCantidadORareza();
}

// Ejecutar al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  chequearDesbloqueosAutomaticos();
});

  // Efectos carta
  document.querySelectorAll('.carousel-item').forEach(contenedor => {
    contenedor.querySelectorAll('.carta').forEach(carta => {
      let isDragging = false, circulosCreados = false;
      function crearCirculos() {
        if (circulosCreados) return;
        (carta.getAttribute("data-circle") || "circle").split(/[\s,]+/).forEach(clase => {
          const c = document.createElement("div");
          c.classList.add(clase);
          carta.appendChild(c);
          const neg = document.createElement("div");
          neg.classList.add(`${clase}-negativo`);
          carta.appendChild(neg);
        });
        circulosCreados = true;
      }
      const start = () => { isDragging = true; crearCirculos(); carta.style.transition = "none"; };
      const move = e => {
        if (!isDragging) return;
        const x = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
        const y = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;
        const rect = carta.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (cx - x) / 10;
        const dy = -(cy - y) / 10;
        carta.style.transform = `perspective(2000px) rotateX(${dy}deg) rotateY(${dx}deg)`;
        carta.querySelectorAll("div[class^='circle']").forEach(c => {
          c.style.left = `${x - rect.left}px`;
          c.style.top = `${y - rect.top}px`;
        });
      };
      const end = () => {
        if (!isDragging) return;
        isDragging = false;
        carta.style.transition = "transform 0.3s ease";
        carta.style.transform = "rotateX(0deg) rotateY(0deg)";
      };
      carta.addEventListener("mouseenter", start);
      carta.addEventListener("mousemove", move);
      carta.addEventListener("mouseleave", end);
      carta.addEventListener("mouseup", end);
      carta.addEventListener("touchstart", start, { passive: true });
      carta.addEventListener("touchmove", move, { passive: true });
      carta.addEventListener("touchend", end);
      carta.addEventListener("touchcancel", end);
    });
  });

  // Efectos líneas de colores
  document.querySelectorAll('.lineascolores').forEach(contenedorLineas => {
    const coloresGrupoA = ['#ff8f2dff', '#00ff2fff', '#04ffd5ff', '#5162ffff'];
    const coloresGrupoB = ['#ff65f7ff', '#eaff00ff', '#19bf00ff', '#4d94ffff'];
    const grupoALineas = [], grupoBLineas = [];
    coloresGrupoA.forEach((color, i) => {
      const linea = document.createElement('div');
      linea.style.position = 'absolute';
      linea.style.width = '100%';
      linea.style.height = '0px';
      linea.style.backgroundColor = color;
      linea.style.boxShadow = `0 0 25px 15px ${color}`;
      linea.style.top = `${30 + i * 100}px`;
      contenedorLineas.appendChild(linea);
      grupoALineas.push(linea);
    });
    coloresGrupoB.forEach((color, i) => {
      const linea = document.createElement('div');
      linea.style.position = 'absolute';
      linea.style.width = '100%';
      linea.style.height = '0px';
      linea.style.backgroundColor = color;
      linea.style.boxShadow = `0 0 25px 15px ${color}`;
      linea.style.top = `${90 + i * 130}px`;
      contenedorLineas.appendChild(linea);
      grupoBLineas.push(linea);
    });
    let ticking = false;
    function moverLineas(e) {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const touch = e.type.includes('touch');
          const x = touch ? e.touches[0].clientX : e.clientX;
          const y = touch ? e.touches[0].clientY : e.clientY;
          const rect = contenedorLineas.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const diffX = x - centerX;
          const diffY = y - centerY;
          const factorY = 0.5, factorXtoY = 0.3;
          const movimientoY_A = -diffY * factorY - diffX * factorXtoY;
          const movimientoY_B = diffY * factorY + diffX * factorXtoY;
          grupoALineas.forEach(linea => linea.style.transform = `translate(0px, ${movimientoY_A}px)`);
          grupoBLineas.forEach(linea => linea.style.transform = `translate(0px, ${movimientoY_B}px)`);
          ticking = false;
        });
        ticking = true;
      }
    }
    function resetLineas() {
      [...grupoALineas, ...grupoBLineas].forEach(linea => linea.style.transform = 'translate(0,0)');
    }
    contenedorLineas.addEventListener('mousemove', moverLineas);
    contenedorLineas.addEventListener('touchmove', moverLineas, { passive: true });
    contenedorLineas.addEventListener('mouseleave', resetLineas);
    contenedorLineas.addEventListener('touchend', resetLineas);
        contenedorLineas.addEventListener('touchcancel', resetLineas);
  });
    });