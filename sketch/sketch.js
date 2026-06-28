// 🔧 Función unificada para mostrar el overlay de revelado de cartas legendarias
// ⚠️ DEBE ESTAR FUERA del DOMContentLoaded para ser accesible globalmente
function mostrarOverlayRevelado(item, esPorCodigo = false) {
  // Validar que sea legendaria
  if (!item.classList.contains("Clegendario")) return;
  
  // Si ya se mostró Y NO viene de código, no mostrar de nuevo
  if (item.dataset.cargaMostrada && !esPorCodigo) return;
  
  // Marcar como mostrada
  item.dataset.cargaMostrada = "true";

  const tarjeta = item.querySelector(".tarjeta");
  if (!tarjeta) return;

  const overlayCarta = document.createElement("div");
  overlayCarta.className = "overlay-revelado";
  tarjeta.appendChild(overlayCarta);

  // ⏱️ Duración extendida si vino desde un canje por código
  const duracion = esPorCodigo ? 2800 : 1300;

  setTimeout(() => {
    overlayCarta.classList.add("fade-out");
    setTimeout(() => overlayCarta.remove(), 800);
  }, duracion);
}

// ========================================================================================
// 🎁 SOBRES DIGITALES
// ========================================================================================
function desbloquearCartaSilenciosa(pass) {
  const wrapper = document.querySelector(`.carta-wrapper[data-pass="${pass}"]`);
  if (!wrapper) return false;

  const overlay = wrapper.querySelector('.overlay-bloqueo');
  if (!overlay) return false;

  const contenedor = wrapper.closest('.cartasgaleriacontainer');
  if (contenedor) {
    const expansionNum = contenedor.getAttribute('data-expansion');
    if (expansionNum && typeof mostrarExpansion === 'function') {
      mostrarExpansion(expansionNum);
    }
  }

  overlay.classList.add('overlay-desbloqueo-sobre');

  setTimeout(() => {
    overlay.remove();
    if (typeof saveProgress === 'function') saveProgress();
    otorgarMonedaSiEsLegendaria(wrapper);
    if (typeof refrescarBadgesGaleria === 'function') refrescarBadgesGaleria();

    wrapper.classList.add('carta-nueva-sobre');
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => wrapper.classList.remove('carta-nueva-sobre'), 1500);

    if (typeof chequearDesbloqueosAutomaticos === 'function') {
      setTimeout(chequearDesbloqueosAutomaticos, 300);
    }
  }, 600);

  return true;
}

// ========================================================================================
// 🪙 Moneda de regalo al desbloquear una carta LEGENDARIA (una sola vez por carta)
// ========================================================================================
function otorgarMonedaSiEsLegendaria(wrapper) {
  if (!wrapper) return;

  const boton = wrapper.querySelector('.cartaejemplo');
  if (!boton || !boton.classList.contains('oro')) return;

  const pass = wrapper.getAttribute('data-pass');
  if (!pass) return;

  const clave = 'moneda_legendaria_' + pass;
  if (localStorage.getItem(clave) === 'true') return;

  localStorage.setItem(clave, 'true');

  if (typeof agregarMonedas === 'function') {
    agregarMonedas(1);
  }

  setTimeout(() => mostrarCartelMonedas(1), 3500);
}

// ========================================================================================
// 🪙 Cartel de "+X monedas"
// ========================================================================================
function mostrarCartelMonedas(cantidad) {
  const mensaje = document.createElement('div');
  mensaje.className = 'mensajeMonedas';
  mensaje.innerHTML = `
    <div class="mensajeMonedas-img"></div>
    <p>+${cantidad} ${cantidad === 1 ? '' : ''}</p>
  `;
  document.body.appendChild(mensaje);
  setTimeout(() => mensaje.remove(), 2200);
}

// ========================================================================================
// 🔔 BADGES DE "¡NUEVO!"
// ========================================================================================

function marcarCartaComoVista(pass) {
  if (!pass) return;
  try {
    const vistas = JSON.parse(localStorage.getItem('michi.vistas') || '[]');
    if (!vistas.includes(pass)) {
      vistas.push(pass);
      localStorage.setItem('michi.vistas', JSON.stringify(vistas));
    }
  } catch (e) {
    console.error('marcarCartaComoVista error', e);
  }
}

function cartaFueVista(pass) {
  try {
    const vistas = JSON.parse(localStorage.getItem('michi.vistas') || '[]');
    return vistas.includes(pass);
  } catch (e) {
    return false;
  }
}

function actualizarBadgesCartasNuevas() {
  document.querySelectorAll('.carta-wrapper').forEach(wrapper => {
    const pass = wrapper.getAttribute('data-pass');
    const bloqueada = !!wrapper.querySelector('.overlay-bloqueo');
    const yaVista = cartaFueVista(pass);
    let badge = wrapper.querySelector('.badge-nuevo-carta');

    if (!bloqueada && pass && !yaVista) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'badge-nuevo-carta';
        wrapper.appendChild(badge);
      }
    } else if (badge) {
      badge.remove();
    }
  });
}

function refrescarBadgesGaleria() {
  actualizarBadgesCartasNuevas();
  if (window.parent && typeof window.parent.actualizarBadgeGaleria === 'function') {
    window.parent.actualizarBadgeGaleria();
  }
}

function actualizarBadgeGaleria() {
  const badge = document.getElementById('badgeGaleria');
  if (!badge) return;

  const iframe = document.getElementById('iframeGaleria');
  const doc = iframe && (iframe.contentDocument || iframe.contentWindow.document);
  if (!doc) { badge.classList.add('oculto'); return; }

  let vistas = [];
  try {
    vistas = JSON.parse(localStorage.getItem('michi.vistas') || '[]');
  } catch (e) {}

  const hayNuevas = Array.from(doc.querySelectorAll('.carta-wrapper')).some(w => {
    const bloqueada = !!w.querySelector('.overlay-bloqueo');
    const pass = w.getAttribute('data-pass');
    return !bloqueada && pass && !vistas.includes(pass);
  });

  badge.classList.toggle('oculto', !hayNuevas);
}

function actualizarBadgeRegalos() {
  const badge = document.getElementById('badgeRegalos');
  if (!badge) return;

  const iframe = document.getElementById('iframeRegalos');
  const doc = iframe && (iframe.contentDocument || iframe.contentWindow.document);
  const hayPendientes = doc ? doc.querySelectorAll('.botonCopiar, .botonMonedas').length > 0 : false;
  const visto = localStorage.getItem('badge_visto_regalos') === 'true';

  badge.classList.toggle('oculto', !hayPendientes || visto);
}

function actualizarBadgeSobres() {
  const badge = document.getElementById('badgeSobres');
  if (!badge) return;
  const visto = localStorage.getItem('badge_visto_sobres') === 'true';
  badge.classList.toggle('oculto', visto);
}

function actualizarBadgeNoticias() {
  const badge = document.getElementById('badgeNoticias');
  if (!badge) return;
  const visto = localStorage.getItem('badge_visto_noticias') === 'true';
  badge.classList.toggle('oculto', visto);
}

function inyectarEstilosSobre() {
  if (document.getElementById('estilos-sobre-digital')) return;

  const style = document.createElement('style');
  style.id = 'estilos-sobre-digital';
  style.textContent = `
    @keyframes sobreDesbloqueoFade {
      0% { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(1.3); }
    }
    .overlay-desbloqueo-sobre {
      animation: sobreDesbloqueoFade 0.6s ease forwards;
    }
    @keyframes cartaNuevaGlow {
      0% { box-shadow: 0 0 0px 0px rgba(255,215,0,0); }
      30% { box-shadow: 0 0 25px 10px rgba(255,215,0,0.9); }
      100% { box-shadow: 0 0 0px 0px rgba(255,215,0,0); }
    }
    .carta-nueva-sobre {
      animation: cartaNuevaGlow 1.5s ease-in-out;
      border-radius: 8px;
    }
  `;
  document.head.appendChild(style);
}
inyectarEstilosSobre();

// ========================================================================================
// 💰 MONEDAS
// ========================================================================================
const CLAVE_MONEDAS = 'michi.monedas';

function obtenerMonedas() {
  try {
    return parseInt(localStorage.getItem(CLAVE_MONEDAS) || '0', 10) || 0;
  } catch (e) {
    console.error('obtenerMonedas error', e);
    return 0;
  }
}

function agregarMonedas(cantidad) {
  const nuevoTotal = Math.max(0, obtenerMonedas() + cantidad);
  try {
    localStorage.setItem(CLAVE_MONEDAS, String(nuevoTotal));
  } catch (e) {
    console.error('agregarMonedas error', e);
  }
  return nuevoTotal;
}

function gastarMonedas(cantidad) {
  if (obtenerMonedas() < cantidad) return false;
  agregarMonedas(-cantidad);
  return true;
}

// ========================================================================================

document.addEventListener("DOMContentLoaded", () => {
  const botones = document.querySelectorAll(".botonCopiar");

  botones.forEach(boton => {
    const codigo = boton.getAttribute("data-codigo");

    if (localStorage.getItem("canjeado_" + codigo) === "true") {
      desactivarBoton(boton);
    }

    boton.addEventListener("click", () => {
      if (localStorage.getItem("canjeado_" + codigo) === "true") return;

      navigator.clipboard.writeText(codigo).then(() => {

        if (window.parent && typeof window.parent.cerrarRegalos === "function") {
          window.parent.cerrarRegalos();
        }

        if (window.parent && typeof window.parent.mostrarGaleria === "function") {
          window.parent.mostrarGaleria();
        }

        setTimeout(() => {
          const iframeGaleria = window.parent.document.getElementById("iframeGaleria");
          if (!iframeGaleria) return;

          const docGaleria = iframeGaleria.contentDocument || iframeGaleria.contentWindow.document;
          const inputCodigo = docGaleria.getElementById("codigoGlobal");
          const botonVerificar = docGaleria.getElementById("botonVerificarCodigo");

          if (inputCodigo && botonVerificar) {
            inputCodigo.value = codigo;
            botonVerificar.click();

            setTimeout(() => {
              const cartaLegendaria = docGaleria.querySelector(`.carta-wrapper[data-pass="${codigo}"]`);
              if (cartaLegendaria) {
                const id = cartaLegendaria.querySelector(".cartaejemplo")?.getAttribute("data-target");
                const item = docGaleria.getElementById(id);
                if (item) mostrarOverlayRevelado(item, true);
              }
            }, 1000);

            localStorage.setItem("canjeado_" + codigo, "true");
            desactivarBoton(boton);

            const mensaje = document.createElement("div");
            mensaje.classList.add("mensajeCanjeado");
            window.parent.document.body.appendChild(mensaje);
            setTimeout(() => mensaje.remove(), 2000);
          }
        }, 1000);
      });
    });
  });

  function desactivarBoton(boton) {
    boton.textContent = "CANJEADO";
    boton.classList.remove("botonCopiar");
    boton.classList.add("botonCanjeado");
    boton.disabled = true;
  }

});


// ------------------------- Galería de cartas -------------------------
function mostrarGaleria() {
  document.getElementById('galeriaContainer').style.display = 'block';
  if (typeof actualizarBadgeGaleria === 'function') actualizarBadgeGaleria();
}
function cerrarGaleria() {
  document.getElementById('galeriaContainer').style.display = 'none';
}
// ------------------------- que es michi box -------------------------

function mostrarQuees() {
  document.getElementById('queesContainer').style.display = 'block';
}
function cerrarQuees() {
  document.getElementById('queesContainer').style.display = 'none';
}
// ------------------------- regalos -------------------------

function mostrarRegalos() {
  document.getElementById('regalosContainer').style.display = 'block';
  localStorage.setItem('badge_visto_regalos', 'true');
  if (typeof actualizarBadgeRegalos === 'function') actualizarBadgeRegalos();
}
function cerrarRegalos() {
  document.getElementById('regalosContainer').style.display = 'none';
}
// ------------------------- DONAR -------------------------

function mostrarDonar() {
  document.getElementById('donarContainer').style.display = 'block';
}
function cerrarDonar() {
  document.getElementById('donarContainer').style.display = 'none';
}
// ------------------------- Noticias -------------------------
function mostrarNoticias() {
  document.getElementById('noticiasContainer').style.display = 'block';
  localStorage.setItem('badge_visto_noticias', 'true');
  if (typeof actualizarBadgeNoticias === 'function') actualizarBadgeNoticias();
}

function cerrarNoticias() {
  document.getElementById('noticiasContainer').style.display = 'none';
  localStorage.setItem("noticiasVistas", "true");
}

// ------------------------- Sobres digitales -------------------------
function mostrarSobres() {
  document.getElementById('sobresContainer').style.display = 'block';
  localStorage.setItem('badge_visto_sobres', 'true');
  if (typeof actualizarBadgeSobres === 'function') actualizarBadgeSobres();
}
function cerrarSobres() {
  document.getElementById('sobresContainer').style.display = 'none';
}

// ------------------------- Mostrar noticias al abrir la app -------------------------
window.addEventListener("load", () => {
  const esPWA = window.matchMedia('(display-mode: standalone)').matches 
                || window.navigator.standalone === true;

  if (esPWA && !localStorage.getItem("noticiasVistas")) {
    mostrarNoticias();
  }
});

// ⏱️ Debounce para evitar guardados excesivos en localStorage
let saveProgressTimer = null;

function saveProgress() {
  if (saveProgressTimer) {
    clearTimeout(saveProgressTimer);
  }
  
  saveProgressTimer = setTimeout(() => {
    try {
      const desbloqueadas = Array.from(document.querySelectorAll('.carta-wrapper'))
        .filter(w => !w.querySelector('.overlay-bloqueo'))
        .map(w => w.getAttribute('data-pass'));
      localStorage.setItem('michi.unlocked', JSON.stringify(desbloqueadas));
    } catch (e) {
      console.error('saveProgress error', e);
    }
  }, 500);
}

function loadProgress() {
  try {
    const unlocked = JSON.parse(localStorage.getItem('michi.unlocked') || '[]');
    unlocked.forEach(pass => {
      const w = document.querySelector(`.carta-wrapper[data-pass="${pass}"]`);
      if (w) {
        const ov = w.querySelector('.overlay-bloqueo');
        if (ov) ov.remove();
      }
    });
  } catch (e) {
    console.error('loadProgress error', e);
  }
}



// ------------------------- Escáner QR -------------------------
let scanner;
const btnAbrir = document.getElementById("btn-abrir-escaner");
const overlay = document.getElementById("overlay");
const cerrar = document.getElementById("cerrar-overlay");
const resultado = document.getElementById("resultado");

if (btnAbrir && overlay && cerrar && resultado) {
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
}

// ------------------------- QR de cada carta por separado -------------------------
const botonCambiar = document.getElementById("botonCambiar");
if (botonCambiar) {
  botonCambiar.addEventListener("click", function () {
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
}

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



// ------------------------- Optimizador de imágenes MEJORADO -------------------------
const lazyLoadObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      
      if (el.dataset.loaded === "true") return;
      
      if (el.dataset.style) {
        el.setAttribute('style', el.dataset.style);
      }
      
      if (el.tagName === 'IMG' && el.dataset.src) {
        el.src = el.dataset.src;
        
        el.onload = () => {
          el.classList.add('loaded');
        };
        
        el.onerror = () => {
          console.error(`Error cargando imagen: ${el.dataset.src}`);
          el.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        };
      }
      
      el.dataset.loaded = "true";
      
      lazyLoadObserver.unobserve(el);
    }
  });
}, {
  rootMargin: '100px',
  threshold: 0.01
});

document.querySelectorAll('.lazy-michi, [data-lazy="true"]').forEach(el => {
  if (!el.dataset.style && el.hasAttribute('style')) {
    el.dataset.style = el.getAttribute('style');
    el.removeAttribute('style');
  }
  
if (el.tagName === 'IMG' && el.hasAttribute('src') && !el.dataset.src) {
  if (!el.src.startsWith('data:image')) {
    el.dataset.src = el.src;
    el.removeAttribute('src');
    el.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  }
}
  
  if (el.dataset.style || (el.tagName === 'IMG' && el.dataset.src)) {
    lazyLoadObserver.observe(el);
  }
});

// ------------------------- DOMContentLoaded -------------------------
document.addEventListener("DOMContentLoaded", () => {
  const carouselItems = document.querySelectorAll(".carousel-item");
  const fondonegro = document.querySelector(".fondonegro");
  
  if (carouselItems.length === 0 || !fondonegro) {
    return;
  }

  loadProgress();
  if (typeof refrescarBadgesGaleria === 'function') refrescarBadgesGaleria();

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

  document.querySelectorAll(".tarjeta").forEach(t => t.classList.add("flip"));
  
  const codigoGlobal = document.getElementById("codigoGlobal");
  const botonVerificarCodigo = document.getElementById("botonVerificarCodigo");
  
  if (codigoGlobal && botonVerificarCodigo) {
    codigoGlobal.addEventListener("keypress", e => {
      if (e.key === "Enter") botonVerificarCodigo.click();
    });
  }

  carouselItems.forEach(item => item.style.display = "none");
  fondonegro.style.display = "none";

  let cartelActivo = null;
  let requisitosActivos = [];
  
  if (botonVerificarCodigo && codigoGlobal) {
    botonVerificarCodigo.addEventListener("click", () => {
      const codigo = codigoGlobal.value.trim();
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
            saveProgress();
            otorgarMonedaSiEsLegendaria(wrapper); // 🪙

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
              if (typeof marcarCartaComoVista === 'function') marcarCartaComoVista(pass);
              if (typeof refrescarBadgesGaleria === 'function') refrescarBadgesGaleria();

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
      codigoGlobal.value = "";
    });
  }


  
const carouselContainer = document.querySelector('.carousel-container');
if (carouselContainer) {
  carouselContainer.addEventListener('click', e => {
    const boton = e.target.closest('.cartaejemplo');
    if (!boton) return;
    
    e.stopPropagation();

    const wrapper = boton.closest('.carta-wrapper');
    if (!wrapper) return;
    
    if (wrapper.querySelector('.overlay-bloqueo')) return;
    
    const id = boton.getAttribute('data-target');
    const item = document.getElementById(id);

    if (item) {
      const pass = wrapper.getAttribute('data-pass');
      if (typeof marcarCartaComoVista === 'function') marcarCartaComoVista(pass);
      if (typeof refrescarBadgesGaleria === 'function') refrescarBadgesGaleria();

      carouselItems.forEach(i => i.style.display = "none");
      item.style.display = "flex";
      fondonegro.style.display = "block";
      document.body.style.overflow = "hidden";

      mostrarOverlayRevelado(item);
    }
  });
}



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

  /* ==========================================================
   SISTEMA DE CARTEL DE BLOQUEO + ANIMACIÓN DE DESBLOQUEO
   ========================================================== */

const galeriaContainer = document.getElementById('GALERIA');
if (galeriaContainer) {
  galeriaContainer.addEventListener('click', e => {
    // Escucha clicks en legendarias (overespecial) Y super raras (oversuper)
    const overlay = e.target.closest('.overlay-bloqueo.overespecial, .overlay-bloqueo.oversuper');
    if (!overlay) return;
    
    e.stopPropagation();

    const mensajePersonalizado = overlay.getAttribute('data-cartel');
    const requisitos = overlay.getAttribute('data-requiere');

    const color =
      overlay.classList.contains("cartel-rojo") ? "rojo" :
      overlay.classList.contains("cartel-azul") ? "azul" :
      overlay.classList.contains("cartel-verde") ? "verde" :
      overlay.classList.contains("cartel-naranja") ? "naranja" :
      "amarillo";

    let contenidoFinal = "";

    if (mensajePersonalizado) {
      contenidoFinal += `${mensajePersonalizado}`;
      if (requisitos) contenidoFinal += generarContenidoCartel(JSON.parse(requisitos));
    } else if (requisitos) {
      contenidoFinal = generarContenidoCartel(JSON.parse(requisitos));
    } else {
      contenidoFinal = "<p>⚠ Carta bloqueada.</p>";
    }

    mostrarCartelEnOverlay(contenidoFinal, color);
  });
}

function generarContenidoCartel(listaIds) {
  let html = "<div class='cartas-requeridas'>";

  listaIds.forEach(passId => {
    const cartaWrapper = document.querySelector(`.carta-wrapper[data-pass="${passId}"]`);

    if (cartaWrapper) {
      const boton = cartaWrapper.querySelector('.cartaejemplo');
      const fondo = boton?.getAttribute('data-style') || "";
      const bloqueada = cartaWrapper.querySelector('.overlay-bloqueo') ? true : false;

      html += `
        <div class="carta-mini ${bloqueada ? 'bloqueada' : ''}" style="${fondo}">
        </div>`;
    }
  });

  html += "</div>";
  return html;
}


function mostrarCartelEnOverlay(htmlContenido, color = "amarillo") {
  const overlayFondo = document.createElement('div');
  overlayFondo.className = 'overlay-fondo';

  const cartel = document.createElement('div');
  cartel.className = 'cartel-advertencia';
  cartel.classList.add(`cartel-${color}-estilo`);

  cartel.innerHTML = `${htmlContenido}<button class="btn-cerrar-cartel">OK</button>`;

  overlayFondo.appendChild(cartel);
  document.body.appendChild(overlayFondo);

  cartel.querySelector('.btn-cerrar-cartel')
        .addEventListener('click', () => overlayFondo.remove());
}

/* ==========================================================
   ANIMACIÓN DE DESBLOQUEO (FLASH + CHISPAS + ALERTA)
   ========================================================== */

function mostrarAlertaDesbloqueo(colorCartel = "amarillo") {

  const coloresChispas = {
    amarillo: ['#FFD700', '#FFA500', '#FFFF00', '#FFE135'],
    rojo: ['#FF0000', '#FF4500', '#DC143C', '#FF6347'],
    azul: ['#00BFFF', '#1E90FF', '#4169E1', '#87CEEB'],
    verde: ['#00FF00', '#32CD32', '#7FFF00', '#90EE90'],
    naranja: ['#FF8C00', '#FF6347', '#FF7F50', '#FFA07A']
  };

  const coloresActuales = coloresChispas[colorCartel] || coloresChispas.amarillo;

  const coloresFlash = {
    amarillo: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.9) 0%, rgba(255, 200, 0, 0.7) 40%, rgba(255, 170, 0, 0) 80%)',
    rojo: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.9) 0%, rgba(255, 60, 60, 0.7) 40%, rgba(255, 0, 0, 0) 80%)',
    azul: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.9) 0%, rgba(70, 130, 255, 0.7) 40%, rgba(0, 100, 255, 0) 80%)',
    verde: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.9) 0%, rgba(0, 255, 100, 0.7) 40%, rgba(0, 200, 0, 0) 80%)',
    naranja: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.9) 0%, rgba(255, 140, 0, 0.7) 40%, rgba(255, 100, 0, 0) 80%)'
  };

  const flash = document.createElement('div');
  flash.className = 'flash-luz';
  flash.style.background = coloresFlash[colorCartel] || coloresFlash.amarillo;
  document.body.appendChild(flash);
  setTimeout(() => flash.classList.add('visible'), 50);
  setTimeout(() => flash.remove(), 1000);

  const fondo = document.createElement('div');
  fondo.className = 'fondoexplosion';
  document.body.appendChild(fondo);

  const NUM_ESTRELLAS = 30;
  const stars = [];

  const startXBase = window.innerWidth - 8;
  const startYBase = 8;

  for (let i = 0; i < NUM_ESTRELLAS; i++) {
    const star = document.createElement('div');
    star.className = 'estrella';

    const size = 3 + Math.random() * 10;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `0px`;
    star.style.top = `0px`;

    const colorChispa = coloresActuales[Math.floor(Math.random() * coloresActuales.length)];
    star.style.background = `radial-gradient(circle, #fff 0%, ${colorChispa} 60%, ${colorChispa} 100%)`;
    star.style.boxShadow = `0 0 18px 6px ${colorChispa}`;

    const cola = document.createElement('div');
    cola.className = 'cola';
    cola.style.background = `linear-gradient(90deg, ${colorChispa}, rgba(255,255,255,0.25), transparent)`;
    star.appendChild(cola);

    const jitterX = -(Math.random() * 12);
    const jitterY = Math.random() * 8 - 4;

    const startX = startXBase + jitterX + 150;
    const startY = startYBase + jitterY - 50;

    const vx = -(120 + Math.random() * 380);
    const vy = -20 + Math.random() * 180;

    const ttl = 1.2 + Math.random() * 1.6;

    stars.push({
      el: star,
      cola,
      x: startX,
      y: startY,
      vx,
      vy,
      ax: 0,
      size,
      ttl,
      born: performance.now(),
      color: colorChispa
    });

    fondo.appendChild(star);
  }

  let last = performance.now();
  function raf(now) {
    const dt = Math.min(0.04, (now - last) / 1000);
    last = now;

    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i];
      const age = (now - s.born) / 1000;

      if (age > s.ttl || s.y > window.innerHeight + 300 || s.x < -300) {
        s.el.remove();
        stars.splice(i, 1);
        continue;
      }

      const gravity = 600;
      s.vy += gravity * dt;

      s.x += s.vx * dt;
      s.y += s.vy * dt;

      const lifeRatio = Math.max(0, Math.min(1, age / s.ttl));
      const scale = 1 - lifeRatio;

      s.el.style.transform = `translate(${s.x}px, ${s.y}px) scale(${scale})`;
      s.el.style.opacity = `${Math.max(0, 1 - lifeRatio)}`;

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

  const alerta = document.createElement('div');
  alerta.className = `alerta-desbloqueo alerta-${colorCartel}`;
  alerta.innerHTML = `</div>`;

  document.body.appendChild(alerta);

  setTimeout(() => {
    fondo.classList.add('visible');
    alerta.classList.add('visible');
  }, 50);

  setTimeout(() => {
    alerta.classList.remove('visible');
    fondo.classList.remove('visible');

    setTimeout(() => {
      alerta.remove();
      fondo.remove();
    }, 1000);
  }, 5000);
}




  function chequearDesbloqueosPorCantidadORareza() {
    document.querySelectorAll('.cartasgaleriacontainer').forEach(expansion => {
  const todasCartas = Array.from(expansion.querySelectorAll('.carta-wrapper'))
    .filter(wrapper => {
      const boton = wrapper.querySelector('.cartaejemplo');
      return boton && !boton.classList.contains('oro');
    });

  const desbloqueadas = todasCartas.filter(wrapper => !wrapper.querySelector('.overlay-bloqueo')).length;

      const normalesTotal = expansion.querySelectorAll('.carta-wrapper .cartaejemplo.comun').length;
      const rarasTotal = expansion.querySelectorAll('.carta-wrapper .cartaejemplo.plata').length;
      const normalesBloqueadas = expansion.querySelectorAll('.overlay-bloqueo.overnormal').length;
      const rarasBloqueadas = expansion.querySelectorAll('.overlay-bloqueo.overraro').length;

      const normalesDesbloqueadas = normalesTotal - normalesBloqueadas;
      const rarasDesbloqueadas = rarasTotal - rarasBloqueadas;

      expansion.querySelectorAll('.carta-wrapper[data-requiere-cantidad], .carta-wrapper[data-requiere-rareza]').forEach(wrapper => {
        const overlay = wrapper.querySelector('.overlay-bloqueo');
        if (!overlay) return;

        if (wrapper.hasAttribute('data-requiere-cantidad')) {
          const cantidadNecesaria = parseInt(wrapper.getAttribute('data-requiere-cantidad'), 10);
          if (desbloqueadas >= cantidadNecesaria) {
const colorCartel =
  overlay.classList.contains("cartel-rojo") ? "rojo" :
  overlay.classList.contains("cartel-azul") ? "azul" :
  overlay.classList.contains("cartel-verde") ? "verde" :
  "amarillo";

overlay.remove();
saveProgress();
otorgarMonedaSiEsLegendaria(wrapper); // 🪙

setTimeout(() => mostrarAlertaDesbloqueo(colorCartel), 3000);
          }
        }

        if (wrapper.hasAttribute('data-requiere-rareza')) {
          const rarezas = wrapper.getAttribute('data-requiere-rareza').split(',');
          let desbloquear = true;
          rarezas.forEach(r => {
            if (r === "normal" && normalesDesbloqueadas !== normalesTotal) desbloquear = false;
            if (r === "raro" && rarasDesbloqueadas !== rarasTotal) desbloquear = false;
          });
          if (desbloquear) {
const colorCartel =
  overlay.classList.contains("cartel-rojo") ? "rojo" :
  overlay.classList.contains("cartel-azul") ? "azul" :
  overlay.classList.contains("cartel-verde") ? "verde" :
  "amarillo";

overlay.remove();
saveProgress();
otorgarMonedaSiEsLegendaria(wrapper); // 🪙

setTimeout(() => mostrarAlertaDesbloqueo(colorCartel), 3000);
          }
        }
      });
    });
  }

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
const colorCartel =
  overlay.classList.contains("cartel-rojo") ? "rojo" :
  overlay.classList.contains("cartel-azul") ? "azul" :
  overlay.classList.contains("cartel-verde") ? "verde" :
  "amarillo";

overlay.remove();
saveProgress();
cambios = true;
otorgarMonedaSiEsLegendaria(wrapper); // 🪙

setTimeout(() => mostrarAlertaDesbloqueo(colorCartel), 3000);

      }
    });
    if (cambios) chequearDesbloqueosAutomaticos();

    chequearDesbloqueosPorCantidadORareza();

    if (typeof refrescarBadgesGaleria === 'function') refrescarBadgesGaleria();
  }

  window.chequearDesbloqueosAutomaticos = chequearDesbloqueosAutomaticos;

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

          // 🎴 Efecto parallax multicapa — data-parallax="N" en cada capa.
          // Cuanto mayor N, más "sale" esa capa hacia el espectador.
          // Ejemplo de uso en HTML:
          //   <img class="sombra lazy-michi" data-parallax="20" .../>  ← capa baja
          //   <img class="sombra lazy-michi" data-parallax="40" .../>  ← capa alta
          const offsetX = (x - cx) / rect.width;
          const offsetY = (y - cy) / rect.height;
          carta.querySelectorAll('[data-parallax]').forEach(capa => {
            const intensidad = parseFloat(capa.dataset.parallax) || 20;
            capa.style.transition = 'none';
            capa.style.transform = `translate(${-offsetX * intensidad}px, ${-offsetY * intensidad}px)`;
          });
        };
        const end = () => {
          if (!isDragging) return;
          isDragging = false;
          carta.style.transition = "transform 0.3s ease";
          carta.style.transform = "rotateX(0deg) rotateY(0deg)";
          // 🎴 Resetear todas las capas parallax a posición original
          carta.querySelectorAll('[data-parallax]').forEach(capa => {
            capa.style.transition = 'transform 0.3s ease';
            capa.style.transform = 'translate(0px, 0px)';
          });
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