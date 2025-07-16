// ---------- FUNCIONES GLOBALES PARA USAR EN HTML INLINE ----------

const toggleDisplay = (el, show, flex = false) => {
  if (!el) return;
  el.style.display = show ? (flex ? 'flex' : 'block') : 'none';
};
const mostrarGaleria = () => toggleDisplay(document.getElementById('galeriaContainer'), true);
const cerrarGaleria = () => toggleDisplay(document.getElementById('galeriaContainer'), false);
const abrirInfo = () => toggleDisplay(document.getElementById('ventanaInfo'), true);
const cerrarInfo = () => toggleDisplay(document.getElementById('ventanaInfo'), false);
const abrirVentanaExpansiones = () => toggleDisplay(document.getElementById('ventanaExpansiones'), true, true);
const cerrarVentanaExpansiones = () => toggleDisplay(document.getElementById('ventanaExpansiones'), false);

// ---------- DENTRO DEl DOMCONTENTLOADED ----------

document.addEventListener("DOMContentLoaded", () => {
  const btnAbrir = document.getElementById("btn-abrir-escaner");
  const overlay = document.getElementById("overlay");
  const cerrarOverlay = document.getElementById("cerrar-overlay");
  const resultado = document.getElementById("resultado");
  const botonCambiar = document.getElementById("botonCambiar");
  const carouselItems = document.querySelectorAll(".carousel-item");
  const fondonegro = document.querySelector(".fondonegro");
  const pantallaNegra = document.getElementById("pantallaNegra");
  const alertaModal = document.getElementById("alertaModal");
  const textoAlerta = document.getElementById("textoAlerta");
  const contenidoAlerta = document.querySelector(".contenido-alerta");
  const codigoGlobal = document.getElementById("codigoGlobal");
  const botonVerificarCodigo = document.getElementById("botonVerificarCodigo");
  const botonAtras = [...document.querySelectorAll('.botonatras')].filter(b => b.textContent.trim() === "X");
  const cartas = document.querySelectorAll(".carta");
  let scanner;
  let indiceCarruseldeExpansiones = 0;

  const mostrarFlex = el => el && (el.style.display = 'flex');
  const ocultar = el => el && (el.style.display = 'none');

  // Evitar zoom por doble tap y gestos (iOS)
  document.addEventListener('gesturestart', e => e.preventDefault());
  let lastTouchEnd = 0;
  document.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
  }, false);
  document.addEventListener('touchstart', e => {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  // Escáner QR
  btnAbrir?.addEventListener("click", () => {
    mostrarFlex(overlay);
    if (!scanner) scanner = new Html5Qrcode("reader");
    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      decodedText => {
        resultado.innerText = "Código QR: " + decodedText;
        scanner.stop().then(() => ocultar(overlay));
      },
      error => { /* Opcional: manejar error */ }
    ).catch(console.error);
  });
  cerrarOverlay?.addEventListener("click", () => {
    if (scanner) {
      scanner.stop()
        .then(() => {
          ocultar(overlay);
          resultado.innerText = "";
        })
        .catch(() => ocultar(overlay));
    } else ocultar(overlay);
  });

  // Mostrar/Ocultar QR de carta activa con efecto suave
  botonCambiar?.addEventListener("click", () => {
    carouselItems.forEach(item => {
      if (window.getComputedStyle(item).display !== "none") {
        const qr = item.querySelector(".codigoqrdecarta");
        if (qr) {
          if (qr.classList.contains("mostrar")) {
            qr.classList.remove("mostrar");
            setTimeout(() => qr.style.display = "none", 400);
          } else {
            qr.style.display = "block";
            setTimeout(() => qr.classList.add("mostrar"), 10);
          }
        }
      }
    });
  });

  // Carrusel expansiones
  const moverCarruseldeExpansiones = direccion => {
    const carrusel = document.querySelector('.carruseldeexpansiones');
    const totalItems = document.querySelectorAll('.carruseldeexpansiones-item').length;
    indiceCarruseldeExpansiones = (indiceCarruseldeExpansiones + direccion + totalItems) % totalItems;
    if (carrusel) carrusel.style.transform = `translateX(-${indiceCarruseldeExpansiones * 100}%)`;
  };

  // Optimización lazy-loading imágenes con IntersectionObserver
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting || target.dataset.loaded) return;
      if (target.dataset.style) target.setAttribute('style', target.dataset.style);
      target.dataset.loaded = "true";
      observer.unobserve(target);
    });
  });
  document.querySelectorAll('.lazy-michi, [data-lazy="true"]').forEach(el => {
    if (!el.dataset.style && el.hasAttribute('style')) {
      el.dataset.style = el.getAttribute('style');
      el.removeAttribute('style');
    }
    if (el.dataset.style) observer.observe(el);
  });

  // Pantalla negra con spinner y bloqueo scroll
  const mostrarPantallaNegra = () => {
    if (!pantallaNegra) return;
    pantallaNegra.classList.add('activo');
    document.body.style.overflow = document.documentElement.style.overflow = "hidden";
  };
  const ocultarPantallaNegra = () => {
    if (!pantallaNegra) return;
    pantallaNegra.classList.remove('activo');
    document.body.style.overflow = document.documentElement.style.overflow = "auto";
  };

  // Alertas personalizadas
  const coloresAlertas = {
    canjeado: { fondo: "rgba(240, 196, 1, 1)", borde: "#ff5c5c" },
    incorrecto: { fondo: "#ff5c5c", borde: "#000" }
  };
  const mostrarAlerta = (mensaje, tipo) => {
    if (!alertaModal || !textoAlerta || !contenidoAlerta) return;
    textoAlerta.textContent = mensaje;
    if (coloresAlertas[tipo]) {
      contenidoAlerta.style.backgroundColor = coloresAlertas[tipo].fondo;
      contenidoAlerta.style.borderColor = coloresAlertas[tipo].borde;
    }
    alertaModal.classList.remove("oculto");
    document.body.style.overflow = "hidden";
  };
  window.cerrarAlerta = () => {
    alertaModal?.classList.add("oculto");
    document.body.style.overflow = "auto";
  };
  document.addEventListener("keydown", e => {
    if (e.key === "Enter" && alertaModal && !alertaModal.classList.contains("oculto")) {
      window.cerrarAlerta();
    }
  });

  // Bloqueo de cartas y verificación de código
  document.querySelectorAll(".tarjeta").forEach(t => t.classList.add("flip"));
  carouselItems.forEach(item => item.style.display = "none");
  fondonegro.style.display = "none";

  codigoGlobal?.addEventListener("keypress", e => {
    if (e.key === "Enter") botonVerificarCodigo?.click();
  });

  botonVerificarCodigo?.addEventListener("click", () => {
    const codigo = codigoGlobal?.value.trim();
    if (!codigo) return;
    let encontrado = false;
    let desbloqueada = false;

    document.querySelectorAll(".carta-wrapper").forEach(wrapper => {
      const overlay = wrapper.querySelector(".overlay-bloqueo");
      if (codigo === wrapper.getAttribute("data-pass")) {
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
        }
      }
    });

    if (!encontrado) mostrarAlerta("CÓDIGO INCORRECTO", "incorrecto");
    else if (!desbloqueada) mostrarAlerta("CÓDIGO YA INGRESADO", "canjeado");
    if (codigoGlobal) codigoGlobal.value = "";
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

  // Cerrar carrusel y ocultar QR
  const cerrarCarrusel = () => {
    carouselItems.forEach(item => {
      item.style.display = "none";
      const qr = item.querySelector(".codigoqrdecarta");
      if (qr) qr.style.display = "none";
    });
    fondonegro.style.display = "none";
    document.body.style.overflow = "auto";
  };
  botonAtras.forEach(boton =>
    boton.addEventListener('click', e => {
      e.stopPropagation();
      cerrarCarrusel();
    })
  );

  // Efectos cartas (parallax, holográfico)
  cartas.forEach(carta => {
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

    const mover = e => {
      const touch = e.type.includes("touch");
      const x = touch ? e.touches[0].clientX : e.clientX;
      const y = touch ? e.touches[0].clientY : e.clientY;
      const rect = carta.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (cx - x) / 10;
      const dy = -(cy - y) / 10;
      carta.style.transform = `perspective(2000px) rotateX(${dy}deg) rotateY(${dx}deg)`;
      carta.querySelectorAll("div[class^='circle']").forEach(c =>
        (c.style.left = `${x - rect.left}px`, c.style.top = `${y - rect.top}px`)
      );
      const dX = x - lastX, dY = y - lastY;
      lastX = x; lastY = y;
      accY1 += dX + dY; accY2 -= dX + dY;
      const hue = (x + y) % 360;
      [fondo, estrellas].forEach(el => el && (el.style.filter = `saturate(2) hue-rotate(${hue}deg)`));
      carta.querySelectorAll('.efectoholograficolineas').forEach((cont, i) => {
        const l1 = cont.querySelectorAll('.line-container:first-of-type .line');
        const l2 = cont.querySelectorAll('.line-container:last-of-type .line');
        [l1, l2].forEach((group, idx) =>
          group.forEach((line, j) => {
            const offset = (j + 1) * (i + 2);
            const yMove = idx === 0 ? accY1 : accY2;
            line.style.transform = `translateY(${yMove / offset}px)`;
          })
        );
      });
    };

    const start = () => {
      carta.style.transition = "transform 0.2s ease-out";
      fondo && (fondo.style.transition = "filter 0.2s ease-out");
      estrellas && (estrellas.style.transition = "filter 0.2s ease-out");
      carta.addEventListener("mousemove", mover);
      carta.addEventListener("touchmove", mover);
    };
    const stop = () => {
      carta.style.transition = "transform 0.6s ease-out";
      carta.style.transform = "rotateY(0deg) rotateX(0deg)";
      fondo && (fondo.style.transition = "filter 0.6s ease-out", fondo.style.filter = "saturate(10)");
      estrellas && (estrellas.style.transition = "filter 0.6s ease-out", estrellas.style.filter = "saturate(10)");
      carta.removeEventListener("mousemove", mover);
      carta.removeEventListener("touchmove", mover);
    };

    carta.addEventListener("mouseenter", start);
    carta.addEventListener("touchstart", start);
    carta.addEventListener("mouseleave", stop);
    carta.addEventListener("touchend", stop);
  });

  // Exponer moverCarruseldeExpansiones para uso externo si es necesario
  window.moverCarruseldeExpansiones = moverCarruseldeExpansiones;
});
