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

document.getElementById("btn-abrir-escaner").addEventListener("click", () => {
  const overlay = document.getElementById("reader-overlay");
  overlay.style.display = "flex"; // Mostrar como overlay centrado

  // Si ya hay un escáner activo, lo reiniciamos
  if (scanner) {
    scanner.stop().then(() => {
      iniciarEscaner();
    }).catch(() => {
      iniciarEscaner();
    });
  } else {
    iniciarEscaner();
  }
});

function iniciarEscaner() {
  scanner = new Html5Qrcode("reader");

  scanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      document.getElementById("resultado").innerText = "Código QR: " + decodedText;

      // Detener escaneo y ocultar overlay
      scanner.stop().then(() => {
        document.getElementById("reader-overlay").style.display = "none";
      });
    },
    (errorMessage) => {
      // Error de lectura (opcional)
    }
  ).catch((err) => {
    console.error("No se pudo iniciar el escáner:", err);
  });
}




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



// ------------------------- boton descargar------------------------

let deferredPrompt;

// Detectar si la app ya está instalada (por ejemplo, para ocultar el botón)
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('La app ya está instalada.');
} else {
  // Esperar a que el navegador dispare el evento de instalación disponible
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // Cancelamos el prompt automático
    deferredPrompt = e;

    const installBtn = document.getElementById('installBtn');
    installBtn.style.display = 'inline-block'; // Mostramos el botón personalizado

    installBtn.addEventListener('click', () => {
      installBtn.disabled = true; // Evita múltiples clics
      deferredPrompt.prompt(); // Mostramos el diálogo oficial

      // Esperamos la decisión del usuario
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('El usuario aceptó instalar la app.');
        } else {
          console.log('El usuario rechazó instalar la app.');
        }

        deferredPrompt = null;
        installBtn.style.display = 'none'; // Ocultamos el botón
      });
    });
  });
}

// Opcional: detectar instalación exitosa
window.addEventListener('appinstalled', () => {
  console.log('La app fue instalada correctamente.');
});





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


// ------------------------- DOM CONTENT LOADED -------------------------
document.addEventListener("DOMContentLoaded", () => {

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
        canjeado: { fondo: "#f0c401", borde: "#ff5c5c" },
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

  document.getElementById("botonVerificarCodigo").addEventListener("click", () => {
    const codigo = document.getElementById("codigoGlobal").value.trim();
    if (!codigo) return;

    let encontrado = false;
    let desbloqueada = false;

    document.querySelectorAll(".carta-wrapper").forEach(wrapper => {
      const overlay = wrapper.querySelector(".overlay-bloqueo");
      const pass = wrapper.getAttribute("data-pass");

      if (codigo === pass) {
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
    carouselItems.forEach(i => i.style.display = "none");
    fondonegro.style.display = "none";
    document.body.style.overflow = "auto";
  };

  document.addEventListener("click", e => {
    if (![...carouselItems].some(i => i.contains(e.target)) && !fondonegro.contains(e.target)) {
      cerrarCarrusel();
    }
  });

  fondonegro.addEventListener("click", cerrarCarrusel);

  // ---------------------- EFECTOS CARTA ----------------------
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

    function mover(e) {
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




});





