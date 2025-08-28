
// ------------------------- galeria de cartas ------------------------

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

function mostrarNoticias() {
  document.getElementById('noticiasContainer').style.display = 'block';
}
function cerrarNoticias() {
  document.getElementById('noticiasContainer').style.display = 'none';
}
// ------------------------- escaner QR------------------------

let scanner;

const btnAbrir = document.getElementById("btn-abrir-escaner");
const overlay = document.getElementById("overlay");
const cerrar = document.getElementById("cerrar-overlay");
const resultado = document.getElementById("resultado");

btnAbrir.addEventListener("click", () => {
  overlay.style.display = "flex";

  if (!scanner) {
    scanner = new Html5Qrcode("reader");
  }

  scanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      resultado.innerText = "Código QR: " + decodedText;
      document.getElementById("codigoGlobal").value = decodedText;
      document.getElementById("botonVerificarCodigo").click();

      scanner.stop().then(() => {
        overlay.style.display = "none";
      });
    },
    (error) => {
      // Opcional: mostrar errores
    }
  ).catch(err => {
    console.error("No se pudo iniciar el escáner:", err);
  });
});

cerrar.addEventListener("click", () => {
  if (scanner) {
    scanner.stop().then(() => {
      overlay.style.display = "none";
      resultado.innerText = "";
    }).catch(() => {
      overlay.style.display = "none";
    });
  } else {
    overlay.style.display = "none";
  }
});

// ------------------------- QR DE CADA CARTA POR SEPARADO------------------------

document.getElementById("botonCambiar").addEventListener("click", function () {
  const carruseles = document.querySelectorAll(".carousel-item");

  carruseles.forEach(item => {
    const estilo = window.getComputedStyle(item);
    if (estilo.display !== "none") {
      const qr = item.querySelector(".codigoqrdecarta");
      if (qr) {
        if (qr.classList.contains("mostrar")) {
          // Ocultar con efecto suave
          qr.classList.remove("mostrar");
          setTimeout(() => {
            qr.style.display = "none";
          }, 400); // Tiempo igual al del transition
        } else {
          // Mostrar con efecto suave
          qr.style.display = "block";
          setTimeout(() => {
            qr.classList.add("mostrar");
          }, 10); // Pequeño delay para que transition se aplique
        }
      }
    }
  });
});
// ------------------------- BOTON EXPANSIONES------------------------

function abrirVentanaExpansiones() {
  document.getElementById("ventanaExpansiones").style.display = "flex";
}

function cerrarVentanaExpansiones() {
  document.getElementById("ventanaExpansiones").style.display = "none";
}

// ------------------------- carrousel de expansiones-----------------------

let indiceCarruseldeExpansiones = 0;

function moverCarruseldeExpansiones(direccion) {
  const carrusel = document.querySelector('.carruseldeexpansiones');
  const totalItems = document.querySelectorAll('.carruseldeexpansiones-item').length;

  indiceCarruseldeExpansiones += direccion;
  if (indiceCarruseldeExpansiones < 0) indiceCarruseldeExpansiones = totalItems - 1;
  if (indiceCarruseldeExpansiones >= totalItems) indiceCarruseldeExpansiones = 0;

  carrusel.style.transform = `translateX(-${indiceCarruseldeExpansiones * 100}%)`;
}

// ------------------------- optimizador de imagenes------------------------

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;

      if (el.dataset.loaded) return;

      // Restaurar el style guardado
      if (el.dataset.style) {
        el.setAttribute('style', el.dataset.style);
      }

      el.dataset.loaded = "true";
      observer.unobserve(el);
    }
  });
});

// Buscar elementos con .lazy-michi o [data-lazy="true"]
document.querySelectorAll('.lazy-michi, [data-lazy="true"]').forEach(el => {
  // Si ya tiene el atributo style inline, lo movemos a data-style automáticamente
  if (!el.dataset.style && el.hasAttribute('style')) {
    el.dataset.style = el.getAttribute('style');
    el.removeAttribute('style');
  }

  // Si tiene data-style válido, lo observamos
  if (el.dataset.style) {
    observer.observe(el);
  }
});

// ------------------------- DOM CONTENT LOADED --------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {

// ------------------------- bloquear zoom global -------------------------

// Evita pinch zoom (Safari iOS principalmente)
document.addEventListener('gesturestart', e => e.preventDefault());

// Evita zoom por doble tap
let lastTouchEnd = 0;
document.addEventListener('touchend', event => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);

// Evita zoom con multitouch (Android/iOS)
document.addEventListener('touchstart', event => {
  if (event.touches.length > 1) {
    event.preventDefault();
  }
}, { passive: false });

  // ------------------------ --------------------------------------------------------------------------

  // Funciones para mostrar y ocultar pantalla negra con spinner y bloqueo scroll
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

  // ------------------ ALERTAS PERSONALIZADAS ------------------
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

  // ----------------- BLOQUEO DE CARTAS -----------------
  document.querySelectorAll(".tarjeta").forEach(t => t.classList.add("flip"));
  const carouselItems = document.querySelectorAll(".carousel-item");
  const fondonegro = document.querySelector(".fondonegro");

  // Se asume que #pantallaNegra está en el HTML con spinner y sin display por defecto (display:none)
  const pantallaNegra = document.getElementById("pantallaNegra");

  document.getElementById("codigoGlobal").addEventListener("keypress", e => {
    if (e.key === "Enter") document.getElementById("botonVerificarCodigo").click();
  });

  carouselItems.forEach(item => item.style.display = "none");
  fondonegro.style.display = "none";

  // Variables para cartel amarillo y requisitos activos
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
    desbloqueada = true;
    mostrarPantallaNegra();

    setTimeout(() => {
      ocultarPantallaNegra();

      const boton = wrapper.querySelector(".cartaejemplo");
      const id = boton?.getAttribute("data-target");
      const item = document.getElementById(id);
      if (item) {
        carouselItems.forEach(i => i.style.display = "none");
        item.style.display = "flex";
        fondonegro.style.display = "block";
        document.body.style.overflow = "hidden";
      }
      setTimeout(() => wrapper.scrollIntoView({ behavior: "smooth", block: "center" }), 200);
    }, 1000);

    // Llamar para chequear desbloqueos automáticos encadenados
    chequearDesbloqueosAutomaticos();
  }
}

    });

    if (!encontrado) {
      mostrarAlerta("CÓDIGO INCORRECTO", "incorrecto");
    } else if (!desbloqueada) {
      mostrarAlerta("CÓDIGO YA INGRESADO", "canjeado");
    }

    document.getElementById("codigoGlobal").value = "";
  });

  // ------------- ABRIR CARTAS YA DESBLOQUEADAS ---------------
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

  const cerrarCarrusel = () => {
    carouselItems.forEach(item => {
      item.style.display = "none";

      // Oculta también el QR si está visible dentro del item
      const qr = item.querySelector(".codigoqrdecarta");
      if (qr) {
        qr.style.display = "none";
      }
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



// -------------------------------- CARTEL AMARILLO CON REQUISITOS -----------------------------------------------------------

// -------------------------------- CARTEL AMARILLO CON REQUISITOS -----------------------------------------------------------

// Guardamos el total inicial de cartas bloqueadas (excluyendo legendarias)
window.totalInicialBloqueos = document.querySelectorAll('.overlay-bloqueo:not(.overespecial)').length;

document.querySelectorAll('.overlay-bloqueo.overespecial').forEach(overlay => {
  overlay.addEventListener('click', e => {
    e.stopPropagation();

    if (overlay.parentElement.contains(overlay)) {
      const mensajePersonalizado = overlay.getAttribute('data-cartel');
      const requisitos = overlay.getAttribute('data-requiere');
      let contenidoFinal = '';

      if (mensajePersonalizado) {
        contenidoFinal += `<p>${mensajePersonalizado}</p>`;
        if (requisitos) {
          const ids = JSON.parse(requisitos);
          contenidoFinal += generarContenidoCartel(ids);
        }
      } else if (requisitos) {
        const ids = JSON.parse(requisitos);
        contenidoFinal = generarContenidoCartel(ids);
      } else {
        contenidoFinal = "<p>⚠ Carta bloqueada.</p>";
      }

      mostrarCartelEnOverlay(contenidoFinal);
    }
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
      html += `
        <div class="carta-mini" style="${fondo}">
          ${bloqueada ? "<div class='mini-overlay'></div>" : ""}
        </div>
      `;
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
  cartel.innerHTML = `
    ${htmlContenido}
    <button class="btn-cerrar-cartel">OK</button>
  `;

  overlayFondo.appendChild(cartel);
  document.body.appendChild(overlayFondo);

  cartel.querySelector('.btn-cerrar-cartel').addEventListener('click', () => {
    overlayFondo.remove();
  });
}

function mostrarAlertaDesbloqueo(mensaje) {
  const alerta = document.createElement('div');
  alerta.className = 'alerta-desbloqueo';

  alerta.innerHTML = `
    <span class="mensaje">${mensaje}</span>
    <div class="circulo-imagen">
      <img src="../assets/cartas/BACK.webp" alt="Carta">
    </div>
  `;

  document.body.appendChild(alerta);

  setTimeout(() => {
    alerta.classList.add('visible');
  }, 50);

  setTimeout(() => {
    alerta.classList.remove('visible');
    setTimeout(() => alerta.remove(), 500);
  }, 5000);
}

// Desbloqueo de legendarias por cantidad de cartas desbloqueadas
function chequearDesbloqueosPorCantidad() {
  // 🔹 Contamos solo las cartas bloqueadas que NO son legendarias
  const bloqueadasAhora = document.querySelectorAll('.overlay-bloqueo:not(.overespecial)').length;
  const desbloqueadas = window.totalInicialBloqueos - bloqueadasAhora;

  document.querySelectorAll('.carta-wrapper[data-requiere-cantidad]').forEach(wrapper => {
    const cantidadNecesaria = parseInt(wrapper.getAttribute('data-requiere-cantidad'), 10);
    const overlay = wrapper.querySelector('.overlay-bloqueo');

    if (overlay && desbloqueadas >= cantidadNecesaria) {
      overlay.remove();
      //  alerta después de 2 segundos
      setTimeout(() => {
        mostrarAlertaDesbloqueo("¡CARTA LEGENDARIA DESBLOQUEADA!");
      }, 3000);
    }
  });
}


// Función que chequea y desbloquea cartas automáticamente según requisitos de otras cartas
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
      if (!cartaReq) return false;
      return !cartaReq.querySelector('.overlay-bloqueo');
    });

    if (todasDesbloqueadas) {
      overlay.remove();
      cambios = true;
      setTimeout(() => {
        mostrarAlertaDesbloqueo("¡CARTA LEGENDARIA DESBLOQUEADA!");
      }, 3000);
    }
  });

  if (cambios) {
    if (cartelActivo && requisitosActivos.length > 0) {
      cartelActivo.innerHTML = generarContenidoCartel(requisitosActivos);
    }
    chequearDesbloqueosAutomaticos();
  }

  // 🔹 Chequeo adicional por cantidad
  chequearDesbloqueosPorCantidad();
}


// ----------------------------------------------------------------------------------------------------------

// ---------------------- EFECTOS CARTA (SIMPLIFICADO Y SEGURO) ----------------------

const contenedores = document.querySelectorAll('.carousel-item');

contenedores.forEach(contenedor => {
  const cartas = contenedor.querySelectorAll('.carta');

  cartas.forEach(carta => {
    let isDragging = false;
    let circulosCreados = false;

    // Crear círculos solo una vez
    function crearCirculos() {
      if (circulosCreados) return;
      const circleClasses = (carta.getAttribute("data-circle") || "circle").split(/[\s,]+/);
      circleClasses.forEach(clase => {
        const c = document.createElement("div");
        c.classList.add(clase);
        carta.appendChild(c);

        const neg = document.createElement("div");
        neg.classList.add(`${clase}-negativo`);
        carta.appendChild(neg);
      });
      circulosCreados = true;
    }

    // Inicia interacción
    function start(e) {
      isDragging = true;
      crearCirculos();
      carta.style.transition = "none"; // desactivar transición mientras se arrastra
    }

    // Mueve la carta
    function move(e) {
      if (!isDragging) return;

      const x = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
      const y = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;

      const rect = carta.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (cx - x) / 10;
      const dy = -(cy - y) / 10;

      carta.style.transform = `perspective(2000px) rotateX(${dy}deg) rotateY(${dx}deg)`;

      // Mover círculos
      carta.querySelectorAll("div[class^='circle']").forEach(c => {
        c.style.left = `${x - rect.left}px`;
        c.style.top = `${y - rect.top}px`;
      });
    }

    // Termina interacción
    function end() {
      if (!isDragging) return;
      isDragging = false;
      carta.style.transition = "transform 0.3s ease";
      carta.style.transform = "rotateX(0deg) rotateY(0deg)";
    }

    // Listeners mouse
    carta.addEventListener("mouseenter", start);
    carta.addEventListener("mousemove", move);
    carta.addEventListener("mouseleave", end);
    carta.addEventListener("mouseup", end);

    // Listeners touch
    carta.addEventListener("touchstart", start, {passive:true});
    carta.addEventListener("touchmove", move, {passive:true});
    carta.addEventListener("touchend", end);
    carta.addEventListener("touchcancel", end);
  });
});




const contenedoresLineas = document.querySelectorAll('.lineascolores');

contenedoresLineas.forEach(contenedorLineas => {
  const coloresGrupoA = ['#ff8f2dff', '#00ff2fff', '#04ffd5ff', '#5162ffff'];
  const coloresGrupoB = ['#ff65f7ff', '#eaff00ff', '#19bf00ff', '#4d94ffff'];

  const grupoALineas = [];
  const grupoBLineas = [];

  // Crear líneas (igual que antes)
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

        const factorY = 0.5;
        const factorXtoY = 0.3;

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
