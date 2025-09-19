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
  // Marcamos que ya se vieron las noticias
  localStorage.setItem("noticiasVistas", "true");
}

// ------------------------- Mostrar noticias al abrir la app -------------------------
window.addEventListener("load", () => {
  const esPWA = window.matchMedia('(display-mode: standalone)').matches 
                || window.navigator.standalone === true;

  // Solo si está en PWA instalada y no vio noticias antes
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

// ------------------------- QR de cada carta por separado -------------------------
document.getElementById("botonCambiar").addEventListener("click", function () {
  const carruseles = document.querySelectorAll(".carousel-item");
  carruseles.forEach(item => {
    const estilo = window.getComputedStyle(item);
    if (estilo.display !== "none") {
      const qr = item.querySelector(".codigoqrdecarta");
      if (qr) {
        if (qr.classList.contains("mostrar")) {
          qr.classList.remove("mostrar");
          setTimeout(() => { qr.style.display = "none"; }, 400);
        } else {
          qr.style.display = "block";
          setTimeout(() => { qr.classList.add("mostrar"); }, 10);
        }
      }
    }
  });
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

// Mostrar la expansión seleccionada y ocultar las demás
function mostrarExpansion(numero) {
  const expansiones = document.querySelectorAll('.cartasgaleriacontainer');
  expansiones.forEach(expansion => {
    if (expansion.getAttribute('data-expansion') === numero) {
      expansion.style.display = 'block'; // mostrar la elegida
    } else {
      expansion.style.display = 'none'; // ocultar las demás
    }
  });
}

// Mostrar expansión 1 por defecto al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  mostrarExpansion("1");
});

// ------------------------- Optimizador de imágenes -------------------------
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      if (el.dataset.loaded) return;
      if (el.dataset.style) el.setAttribute('style', el.dataset.style);
      el.dataset.loaded = "true";
      observer.unobserve(el);
    }
  });
});

document.querySelectorAll('.lazy-michi, [data-lazy="true"]').forEach(el => {
  if (!el.dataset.style && el.hasAttribute('style')) {
    el.dataset.style = el.getAttribute('style');
    el.removeAttribute('style');
  }
  if (el.dataset.style) observer.observe(el);
});

// ------------------------- DOMContentLoaded -------------------------
document.addEventListener("DOMContentLoaded", () => {
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
  const alerta = document.createElement('div');
  alerta.className = 'alerta-desbloqueo';
  alerta.innerHTML = `<span class="mensaje">¡CARTA LEGENDARIA DESBLOQUEADA!</span>
    <div class="circulo-imagen"><img src="../assets/icon-192.png" alt="Carta"></div>`;
  document.body.appendChild(alerta);
  setTimeout(() => alerta.classList.add('visible'), 50);
  setTimeout(() => {
    alerta.classList.remove('visible');
    setTimeout(() => alerta.remove(), 500);
  }, 5000);
}

// Desbloqueo por cantidad O por rareza específica (separado por expansión)
function chequearDesbloqueosPorCantidadORareza() {
  document.querySelectorAll('.cartasgaleriacontainer').forEach(expansion => {
    // Cantidad de cartas desbloqueadas dentro de la expansión
    const todasCartas = Array.from(expansion.querySelectorAll('.carta-wrapper:not(.overespecial)'));
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