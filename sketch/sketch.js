// Función para sacar el color promedio de una imagen
function obtenerColorDominante(img, callback) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  img.crossOrigin = "Anonymous"; // necesario si es de otro dominio
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);

    const data = ctx.getImageData(0, 0, img.width, img.height).data;
    let r=0, g=0, b=0, count=0;

    for (let i=0; i<data.length; i+=4) {
      r += data[i];
      g += data[i+1];
      b += data[i+2];
      count++;
    }
    r = Math.floor(r/count);
    g = Math.floor(g/count);
    b = Math.floor(b/count);

    callback(`rgb(${r},${g},${b})`);
  };
}

// Función que cambia el meta theme-color
function cambiarColorBarra(color) {
  let meta = document.querySelector("meta[name=theme-color]");
  meta.setAttribute("content", color);
}

// Detectar click en cada imagen y cambiar el color
document.querySelectorAll(".imagen").forEach(img => {
  img.addEventListener("click", () => {
    obtenerColorDominante(img, color => {
      cambiarColorBarra(color);
    });
  });
});


// ------------------------- Utilidades de mostrar/ocultar ------------------------
const containers = {
  galeria: document.getElementById('galeriaContainer'),
  quees: document.getElementById('queesContainer'),
  noticias: document.getElementById('noticiasContainer')
};

const toggleContainer = (key, show = true) => {
  if (containers[key]) containers[key].style.display = show ? 'block' : 'none';
};

window.mostrarGaleria = () => toggleContainer('galeria', true);
window.cerrarGaleria = () => toggleContainer('galeria', false);
window.mostrarQuees = () => toggleContainer('quees', true);
window.cerrarQuees = () => toggleContainer('quees', false);
window.mostrarNoticias = () => toggleContainer('noticias', true);
window.cerrarNoticias = () => toggleContainer('noticias', false);

// ------------------------- Escáner QR ------------------------
let scanner;
const btnAbrir = document.getElementById("btn-abrir-escaner");
const overlay = document.getElementById("overlay");
const resultado = document.getElementById("resultado");
const cerrar = document.getElementById("cerrar-overlay");

btnAbrir?.addEventListener("click", () => {
  overlay.style.display = "flex";
  if (!scanner) scanner = new Html5Qrcode("reader");
  scanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    decodedText => {
      resultado.innerText = "Código QR: " + decodedText;
      document.getElementById("codigoGlobal").value = decodedText;
      document.getElementById("botonVerificarCodigo").click();
      scanner.stop().then(() => overlay.style.display = "none");
    }
  ).catch(err => console.error("No se pudo iniciar el escáner:", err));
});

cerrar?.addEventListener("click", () => {
  if (scanner) {
    scanner.stop().then(() => {
      overlay.style.display = "none";
      resultado.innerText = "";
    }).catch(() => overlay.style.display = "none");
  } else {
    overlay.style.display = "none";
  }
});

// ------------------------- QR de cada carta ------------------------
document.getElementById("botonCambiar")?.addEventListener("click", () => {
  document.querySelectorAll(".carousel-item").forEach(item => {
    if (window.getComputedStyle(item).display !== "none") {
      const qr = item.querySelector(".codigoqrdecarta");
      if (qr) {
        qr.classList.toggle("mostrar");
        qr.style.display = qr.classList.contains("mostrar") ? "block" : "none";
      }
    }
  });
});

// ------------------------- Botón Expansiones ------------------------
window.abrirVentanaExpansiones = () => document.getElementById("ventanaExpansiones").style.display = "flex";
window.cerrarVentanaExpansiones = () => document.getElementById("ventanaExpansiones").style.display = "none";

// ------------------------- Carrusel de expansiones ------------------------
let indiceCarruseldeExpansiones = 0;
window.moverCarruseldeExpansiones = direccion => {
  const carrusel = document.querySelector('.carruseldeexpansiones');
  const totalItems = document.querySelectorAll('.carruseldeexpansiones-item').length;
  indiceCarruseldeExpansiones = (indiceCarruseldeExpansiones + direccion + totalItems) % totalItems;
  carrusel.style.transform = `translateX(-${indiceCarruseldeExpansiones * 100}%)`;
};

// ------------------------- Lazy loading de imágenes ------------------------
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      if (!el.dataset.loaded && el.dataset.style) {
        el.setAttribute('style', el.dataset.style);
        el.dataset.loaded = "true";
        observer.unobserve(el);
      }
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

// ------------------------- DOMContentLoaded ------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Bloqueo de zoom global
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
  const pantallaNegra = document.getElementById('pantallaNegra');
  const mostrarPantallaNegra = () => {
    pantallaNegra?.classList.add('activo');
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  };
  const ocultarPantallaNegra = () => {
    pantallaNegra?.classList.remove('activo');
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
  };

  // Alertas personalizadas
  const mostrarAlerta = (mensaje, tipo) => {
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
  };

  window.cerrarAlerta = () => {
    document.getElementById("alertaModal")?.classList.add("oculto");
    document.body.style.overflow = "auto";
  };

  document.addEventListener("keydown", e => {
    if (e.key === "Enter" && !document.getElementById("alertaModal")?.classList.contains("oculto")) {
      window.cerrarAlerta();
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
  let cartelActivo = null, requisitosActivos = [];
  document.getElementById("botonVerificarCodigo").addEventListener("click", () => {
    const codigo = document.getElementById("codigoGlobal").value.trim();
    if (!codigo) return;
    let encontrado = false, desbloqueada = false;
    document.querySelectorAll(".carta-wrapper").forEach(wrapper => {
      const overlay = wrapper.querySelector(".overlay-bloqueo");
      const pass = wrapper.getAttribute("data-pass");
      if (codigo.toLowerCase() === pass.toLowerCase()) {
        encontrado = true;
        if (overlay) {
          overlay.remove();
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
            setTimeout(() => wrapper.scrollIntoView({ behavior: "smooth", block: "center" }), 200);
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
      boton.addEventListener('click', e => {
        e.stopPropagation();
        cerrarCarrusel();
      });
    }
  });

  // Cartel amarillo con requisitos
  window.totalInicialBloqueos = document.querySelectorAll('.overlay-bloqueo:not(.overespecial)').length;
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
    return `<div class='cartas-requeridas'>${listaIds.map(passId => {
      const cartaWrapper = document.querySelector(`.carta-wrapper[data-pass="${passId}"]`);
      if (cartaWrapper) {
        const boton = cartaWrapper.querySelector('.cartaejemplo');
        const fondo = boton?.getAttribute('data-style') || "";
        const bloqueada = cartaWrapper.querySelector('.overlay-bloqueo');
        return `<div class="carta-mini" style="${fondo}">${bloqueada ? "<div class='mini-overlay'></div>" : ""}</div>`;
      }
      return "";
    }).join('')}</div>`;
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

  function mostrarAlertaDesbloqueo(mensaje) {
    const alerta = document.createElement('div');
    alerta.className = 'alerta-desbloqueo';
    alerta.innerHTML = `<span class="mensaje">${mensaje}</span>
      <div class="circulo-imagen"><img src="../assets/icon-192.png" alt="Carta"></div>`;
    document.body.appendChild(alerta);
    setTimeout(() => alerta.classList.add('visible'), 50);
    setTimeout(() => {
      alerta.classList.remove('visible');
      setTimeout(() => alerta.remove(), 500);
    }, 5000);
  }

  // Desbloqueo de legendarias por cantidad de cartas desbloqueadas
  function chequearDesbloqueosPorCantidad() {
    const bloqueadasAhora = document.querySelectorAll('.overlay-bloqueo:not(.overespecial)').length;
    const desbloqueadas = window.totalInicialBloqueos - bloqueadasAhora;
    document.querySelectorAll('.carta-wrapper[data-requiere-cantidad]').forEach(wrapper => {
      const cantidadNecesaria = parseInt(wrapper.getAttribute('data-requiere-cantidad'), 10);
      const overlay = wrapper.querySelector('.overlay-bloqueo');
      if (overlay && desbloqueadas >= cantidadNecesaria) {
        overlay.remove();
        setTimeout(() => mostrarAlertaDesbloqueo("¡CARTA LEGENDARIA DESBLOQUEADA!"), 3000);
      }
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
        setTimeout(() => mostrarAlertaDesbloqueo("¡CARTA LEGENDARIA DESBLOQUEADA!"), 3000);
      }
    });
    if (cambios) chequearDesbloqueosAutomaticos();
    chequearDesbloqueosPorCantidad();
  }

  // Efectos carta
  document.querySelectorAll('.carousel-item').forEach(contenedor => {
    contenedor.querySelectorAll('.carta').forEach(carta => {
      let isDragging = false, circulosCreados = false;
      const crearCirculos = () => {
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
      };
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
    const moverLineas = e => {
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
    };
    const resetLineas = () => [...grupoALineas, ...grupoBLineas].forEach(linea => linea.style.transform = 'translate(0,0)');
    contenedorLineas.addEventListener('mousemove', moverLineas);
    contenedorLineas.addEventListener('touchmove', moverLineas, { passive: true });
    contenedorLineas.addEventListener('mouseleave', resetLineas);
    contenedorLineas.addEventListener('touchend', resetLineas);
    contenedorLineas.addEventListener('touchcancel', resetLineas);
  });

  
  
});