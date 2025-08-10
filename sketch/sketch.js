// ------------------------- galeria de cartas ------------------------

function mostrarGaleria() {
  document.getElementById('galeriaContainer').style.display = 'block';
}
function cerrarGaleria() {
  document.getElementById('galeriaContainer').style.display = 'none';
}

function abrirInfo() {
  document.getElementById('ventanaInfo').style.display = 'block';
}

function cerrarInfo() {
  document.getElementById('ventanaInfo').style.display = 'none';
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

  // ------------------------- quitar zoom doble tap ------------------------

  // Bloquear zoom por gesto (Safari iOS)
  document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
  });

  // Bloquear zoom por doble toque (double-tap)
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function (event) {
    const now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault(); // ← evita el zoom
    }
    lastTouchEnd = now;
  }, false);

  // Prevenir el zoom por doble toque en elementos con foco (iOS a veces lo permite igual)
  document.addEventListener('touchstart', function (event) {
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
      <img src="../assets/notif_legend.webp" alt="Carta">
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







/*  // ---------------------- EFECTOS CARTA ----------------------
// ---------------------- EFECTOS CARTA OPTIMIZADOS ----------------------
const cartas = document.querySelectorAll(".carta");

function aplicarEfectos(carta) {
  const circleClasses = (carta.getAttribute("data-circle") || "circle").split(/[\s,]+/);
  circleClasses.forEach(clase => {
    const c = document.createElement("div");
    c.classList.add(clase);
    carta.appendChild(c);

    const neg = document.createElement("div");
    neg.classList.add(`${clase}-negativo`);
    carta.appendChild(neg);
  });

  const fondo = carta.querySelector(".fondo-rainbow");
  const estrellas = carta.querySelector(".capaholograficaestrellas");

  let lastX = 0, lastY = 0, accY1 = 0, accY2 = 0;
  let ticking = false; // Para controlar requestAnimationFrame

  function actualizarMovimiento(e) {
    const touch = e.type.includes("touch");
    const x = touch ? e.touches[0].clientX : e.clientX;
    const y = touch ? e.touches[0].clientY : e.clientY;
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

    const dX = x - lastX;
    const dY = y - lastY;
    lastX = x; lastY = y;

    accY1 += dX + dY;
    accY2 -= dX + dY;

    const hue = (x + y) % 360;
    [fondo, estrellas].forEach(el => el && (el.style.filter = `saturate(2) hue-rotate(${hue}deg)`));

    carta.querySelectorAll('.efectoholograficolineas').forEach((cont, i) => {
      const l1 = cont.querySelectorAll('.line-container:first-of-type .line');
      const l2 = cont.querySelectorAll('.line-container:last-of-type .line');
      [l1, l2].forEach((group, idx) => {
        group.forEach((line, j) => {
          const offset = (j + 1) * (i + 2);
          const yMove = idx === 0 ? accY1 : accY2;
          line.style.transform = `translateY(${yMove / offset}px)`;
        });
      });
    });
  }

  function mover(e) {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        actualizarMovimiento(e);
        ticking = false;
      });
      ticking = true;
    }
  }

  function start() {
    carta.style.transition = "transform 0.2s ease-out";
    fondo && (fondo.style.transition = "filter 0.2s ease-out");
    estrellas && (estrellas.style.transition = "filter 0.2s ease-out");
    carta.addEventListener("mousemove", mover);
    carta.addEventListener("touchmove", mover);
  }

  function stop() {
    carta.style.transition = "transform 0.6s ease-out";
    carta.style.transform = "rotateY(0deg) rotateX(0deg)";
    fondo && (fondo.style.transition = "filter 0.6s ease-out", fondo.style.filter = "saturate(10)");
    estrellas && (estrellas.style.transition = "filter 0.6s ease-out", estrellas.style.filter = "saturate(10)");
    carta.removeEventListener("mousemove", mover);
    carta.removeEventListener("touchmove", mover);
  }

  carta.addEventListener("mouseenter", start);
  carta.addEventListener("touchstart", start);
  carta.addEventListener("mouseleave", stop);
  carta.addEventListener("touchend", stop);
}

cartas.forEach(aplicarEfectos);

*/




// ---------------------- EFECTOS CARTA (SIN LÍNEAS) ----------------------
// ---------------------- EFECTOS CARTA (SIN LÍNEAS) ----------------------

const contenedores = document.querySelectorAll('.carousel-item');

contenedores.forEach(contenedor => {

  // WeakMap para estado por carta (no fuga de memoria)
  const estadoCartas = new WeakMap();

  // Crea círculos solo una vez por carta
  function crearCirculosSiNoExiste(carta) {
    if (estadoCartas.get(carta)?.circulosCreados) return;

    const circleClasses = (carta.getAttribute("data-circle") || "circle").split(/[\s,]+/);
    circleClasses.forEach(clase => {
      const c = document.createElement("div");
      c.classList.add(clase);
      carta.appendChild(c);

      const neg = document.createElement("div");
      neg.classList.add(`${clase}-negativo`);
      carta.appendChild(neg);
    });

    const estadoActual = estadoCartas.get(carta) || {};
    estadoCartas.set(carta, {
      ...estadoActual,
      circulosCreados: true
    });
  }

  // Actualiza movimiento, usa elementos cacheados para evitar consultas repetidas
  function actualizarMovimiento(e, carta) {
    const estado = estadoCartas.get(carta);
    if (!estado) return;

    const touch = e.type.includes("touch");
    const x = touch ? e.touches[0].clientX : e.clientX;
    const y = touch ? e.touches[0].clientY : e.clientY;
    const rect = carta.getBoundingClientRect();

    // Centro relativo al viewport
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Movimientos para rotación (suavizados)
    const dx = (cx - x) / 10;
    const dy = -(cy - y) / 10;

    // Aplicar transformación 3D
    carta.style.transform = `perspective(2000px) rotateX(${dy}deg) rotateY(${dx}deg)`;

    // Mover círculos (si existen)
    carta.querySelectorAll("div[class^='circle']").forEach(c => {
      c.style.left = `${x - rect.left}px`;
      c.style.top = `${y - rect.top}px`;
    });

    // Guardar coords actuales (por si acaso)
    estado.lastX = x;
    estado.lastY = y;
  }

  function iniciarEfectos(carta) {
    let estado = estadoCartas.get(carta);
    if (!estado) {
      estado = {};
      estadoCartas.set(carta, estado);
    }
    if (estado.efectosActivos) return;

    crearCirculosSiNoExiste(carta);

    // No se cachean fondo ni estrellas porque se eliminaron

    carta.style.transition = "transform 0.2s ease-out";

    function throttledMover(e) {
      if (!estado.ticking) {
        window.requestAnimationFrame(() => {
          actualizarMovimiento(e, carta);
          estado.ticking = false;
        });
        estado.ticking = true;
      }
    }

    estado.moverListener = throttledMover;
    carta.addEventListener("mousemove", throttledMover);
    carta.addEventListener("touchmove", throttledMover, { passive: true });

    estado.efectosActivos = true;
  }

  function detenerEfectos(carta) {
    const estado = estadoCartas.get(carta);
    if (!estado || !estado.efectosActivos) return;

    carta.style.transition = "transform 0.6s ease-out";
    carta.style.transform = "rotateY(0deg) rotateX(0deg)";

    // No se aplica filtro porque se eliminaron los elementos

    carta.removeEventListener("mousemove", estado.moverListener);
    carta.removeEventListener("touchmove", estado.moverListener);
    estado.moverListener = null;
    estado.efectosActivos = false;
  }

  // Delegación eventos mouseenter/mouseleave en captura para detectar cartas
  contenedor.addEventListener('mouseenter', e => {
    const carta = e.target.closest('.carta');
    if (!carta || !contenedor.contains(carta)) return;
    iniciarEfectos(carta);
  }, true);

  contenedor.addEventListener('mouseleave', e => {
    const carta = e.target.closest('.carta');
    if (!carta || !contenedor.contains(carta)) return;
    detenerEfectos(carta);
  }, true);

  // Delegación touch
  contenedor.addEventListener('touchstart', e => {
    const carta = e.target.closest('.carta');
    if (!carta || !contenedor.contains(carta)) return;
    iniciarEfectos(carta);
  }, { passive: true });

  contenedor.addEventListener('touchend', e => {
    const carta = e.target.closest('.carta');
    if (!carta || !contenedor.contains(carta)) return;
    detenerEfectos(carta);
  });

});



const contenedoresLineas = document.querySelectorAll('.lineascolores');

contenedoresLineas.forEach(contenedorLineas => {
  // Colores para los dos grupos
  const coloresGrupoA = ['#ff8f2dff', '#00ff2fff', '#04ffd5ff', '#5162ffff'];
  const coloresGrupoB = ['#ff65f7ff', '#eaff00ff', '#19bf00ff', '#4d94ffff'];

  const grupoALineas = [];
  const grupoBLineas = [];

  // Crear Grupo A
  for (let i = 0; i < 4; i++) {
    const linea = document.createElement('div');
    linea.style.position = 'absolute';
    linea.style.width = '100%';
    linea.style.height = '0px';  // Cambié de 0px a 4px para que se vean
    linea.style.backgroundColor = coloresGrupoA[i];
    linea.style.boxShadow = `0 0 25px 15px ${coloresGrupoA[i]}`;
    linea.style.top = `${30 + i * 100}px`;
    linea.style.left = '0px';
    linea.style.transition = 'transform 0.1s ease-out';
    contenedorLineas.appendChild(linea);
    grupoALineas.push(linea);
  }

  // Crear Grupo B
  for (let i = 0; i < 4; i++) {
    const linea = document.createElement('div');
    linea.style.position = 'absolute';
    linea.style.width = '100%';
    linea.style.height = '0px';  // Cambié de 0px a 4px para que se vean
    linea.style.backgroundColor = coloresGrupoB[i];
    linea.style.boxShadow = `0 0 25px 15px ${coloresGrupoB[i]}`;
    linea.style.top = `${90 + i * 130}px`;
    linea.style.left = '0px';
    linea.style.transition = 'transform 0.1s ease-out';
    contenedorLineas.appendChild(linea);
    grupoBLineas.push(linea);
  }

  function moverLineas(e) {
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
    const movimientoX_A = 0;

    const movimientoY_B = diffY * factorY + diffX * factorXtoY;
    const movimientoX_B = 0;

    grupoALineas.forEach(linea => {
      linea.style.transform = `translate(${movimientoX_A}px, ${movimientoY_A}px)`;
    });

    grupoBLineas.forEach(linea => {
      linea.style.transform = `translate(${movimientoX_B}px, ${movimientoY_B}px)`;
    });
  }

  contenedorLineas.addEventListener('mousemove', moverLineas);
  contenedorLineas.addEventListener('touchmove', moverLineas, { passive: true });

  function resetLineas() {
    [...grupoALineas, ...grupoBLineas].forEach(linea => {
      linea.style.transform = 'translate(0, 0)';
    });
  }

  contenedorLineas.addEventListener('mouseleave', resetLineas);
  contenedorLineas.addEventListener('touchend', resetLineas);
});

});
