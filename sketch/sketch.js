document.addEventListener("DOMContentLoaded", () => {
  // ----------------- FUNCIONES DE ALERTA PERSONALIZADA -----------------
  function mostrarAlerta(mensaje, tipo) {
    const modal = document.getElementById("alertaModal");
    const texto = document.getElementById("textoAlerta");
    const contenido = document.querySelector(".contenido-alerta");

    if (modal && texto && contenido) {
      texto.textContent = mensaje;

      //  colores del alerta :)
      const colores = {
        canjeado: { fondo: "#f0c401", borde: "#ff5c5c" }, // Amarillo
        incorrecto: { fondo: "#ff5c5c", borde: "#000" } // Rojo
      };

      if (colores[tipo]) {
        contenido.style.backgroundColor = colores[tipo].fondo;
        contenido.style.borderColor = colores[tipo].borde;
      }

      modal.classList.remove("oculto");
      document.body.style.overflow = "hidden";
    }
  }

  window.cerrarAlerta = function () {
    document.getElementById("alertaModal")?.classList.add("oculto");
    document.body.style.overflow = "auto";
  };
  document.addEventListener("keydown", function (e) {
    const modal = document.getElementById("alertaModal");
    if (e.key === "Enter" && modal && !modal.classList.contains("oculto")) {
      cerrarAlerta();
    }
  });
  // ----------------- CARTAS BLOQUEADAS ---------------------------------
  document.querySelectorAll(".tarjeta").forEach(t => t.classList.add("flip"));

  const carouselItems = document.querySelectorAll(".carousel-item");
  const fondonegro = document.querySelector(".fondonegro");
  const pantallaNegra = document.getElementById("pantallaNegra") || (() => {
    const div = document.createElement("div");
    div.id = "pantallaNegra";
    div.style.cssText = `
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: black;
      z-index: 9999;
    `;
    document.body.appendChild(div);
    return div;
  })();

  document.getElementById("codigoGlobal").addEventListener("keypress", e => {
    if (e.key === "Enter") document.getElementById("botonVerificarCodigo").click();
  });

  carouselItems.forEach(item => item.style.display = "none");
  fondonegro.style.display = "none";

  //  DESBLOQUEO 
  document.getElementById("botonVerificarCodigo").addEventListener("click", () => {
    const codigoIngresado = document.getElementById("codigoGlobal").value.trim();
    if (!codigoIngresado) return;

    let codigoEncontrado = false;
    let cartaDesbloqueada = false;

    document.querySelectorAll(".carta-wrapper").forEach(wrapper => {
      const overlay = wrapper.querySelector(".overlay-bloqueo");
      const passCorrecta = wrapper.getAttribute("data-pass");

      if (codigoIngresado === passCorrecta) {
        codigoEncontrado = true;

        if (overlay) {
          overlay.remove();
          cartaDesbloqueada = true;
          pantallaNegra.style.display = "block";

          setTimeout(() => {
            pantallaNegra.style.display = "none";

            const boton = wrapper.querySelector(".cartaejemplo");
            const id = boton?.getAttribute("data-target");
            const itemToShow = document.getElementById(id);

            if (itemToShow) {
              carouselItems.forEach(item => item.style.display = "none");
              itemToShow.style.display = "flex";
              fondonegro.style.display = "block";
              document.body.style.overflow = "hidden";
            }

            setTimeout(() => wrapper.scrollIntoView({ behavior: "smooth", block: "center" }), 200);
          }, 1000);
        }
      }
    });

    if (!codigoEncontrado) {
      mostrarAlerta("CÓDIGO INCORRECTO", "incorrecto");
    } else if (!cartaDesbloqueada) {
      mostrarAlerta("CÓDIGO YA INGRESADO", "canjeado");
    } else {
    }
    document.getElementById("codigoGlobal").value = "";
  });

  // ✅ Si ya está desbloqueada, clic abre directamente
  document.querySelectorAll(".cartaejemplo").forEach(boton => {
    boton.addEventListener("click", event => {
      event.stopPropagation();

      const wrapper = boton.closest(".carta-wrapper");
      if (!wrapper.querySelector(".overlay-bloqueo")) {
        const id = boton.getAttribute("data-target");
        const itemToShow = document.getElementById(id);

        if (itemToShow) {
          carouselItems.forEach(item => item.style.display = "none");
          itemToShow.style.display = "flex";
          fondonegro.style.display = "block";
          document.body.style.overflow = "hidden";
        }
      }
    });
  });

  // Cierre de carrusel
  function cerrarCarrusel() {
    carouselItems.forEach(item => item.style.display = "none");
    fondonegro.style.display = "none";
    document.body.style.overflow = "auto";
  }

  document.addEventListener("click", event => {
    if (![...carouselItems].some(item => item.contains(event.target)) && !fondonegro.contains(event.target)) {
      cerrarCarrusel();
    }
  });

  fondonegro.addEventListener("click", cerrarCarrusel);
});

// ----------------- RESPLANDOR CARTA Y EFECTO 3D -----------------

document.addEventListener("DOMContentLoaded", function() { 
  const cartas = document.querySelectorAll(".carta");

  function aplicarEfectos(elemento) {
    const circleClasses = (elemento.getAttribute("data-circle") || "circle").split(/[\s,]+/);
    circleClasses.forEach(circleClass => {
      const circle = document.createElement("div");
      circle.classList.add(circleClass);
      elemento.appendChild(circle);

     // Crear y agregar circlenegativo
     const circleNegativo = document.createElement("div");
     circleNegativo.classList.add(`${circleClass}-negativo`); // Nombre único para diferenciarlos
     elemento.appendChild(circleNegativo);
   });

    const fondoRainbow = elemento.querySelector(".fondo-rainbow");
    const capaHolograficaEstrellas = elemento.querySelector(".capaholograficaestrellas");
    
    let lastPositionX = 0;
    let lastPositionY = 0;
    let accumulatedY1 = 0;
    let accumulatedY2 = 0;

    const moverLineas = (e) => {
      const isTouchEvent = e.type.includes("touch");
      const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
      const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;

      const rect = elemento.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const xAxis = (centerX - clientX) / 10;
      const yAxis = -(centerY - clientY) / 10;

      elemento.style.transform = `perspective(2000px) rotateX(${yAxis}deg) rotateY(${xAxis}deg)`;

      const circles = elemento.querySelectorAll("div[class^='circle']");
      const circleNegativos = elemento.querySelectorAll("div[class*='circlenegativo']");

      // Mover circles hacia el mouse
      circles.forEach(circle => {
        circle.style.left = `${clientX - rect.left}px`;
        circle.style.top = `${clientY - rect.top}px`;
      });


      const deltaX = clientX - lastPositionX;
      const deltaY = clientY - lastPositionY;
      lastPositionX = clientX;
      lastPositionY = clientY;

      const totalDelta = deltaX + deltaY;
      accumulatedY1 += totalDelta;
      accumulatedY2 -= totalDelta;

      const hueValue = (clientX + clientY) % 360;
      
      [fondoRainbow, capaHolograficaEstrellas].forEach(elemento => {
        if (elemento) {
          elemento.style.filter = `saturate(2) hue-rotate(${hueValue}deg)`;
        }
      });

      const effectContainers = elemento.querySelectorAll('.efectoholograficolineas');
      effectContainers.forEach((container, idx) => {
        const lines1 = container.querySelectorAll('.line-container:first-of-type .line');
        lines1.forEach((line, index) => {
          const offset = (index + 1) * (idx + 2);
          line.style.transform = `translateY(${accumulatedY1 / offset}px)`;
        });

        const lines2 = container.querySelectorAll('.line-container:last-of-type .line');
        lines2.forEach((line, index) => {
          const offset = (index + 1) * (idx + 2);
          line.style.transform = `translateY(${accumulatedY2 / offset}px)`;
        });
      });
    };

    const startInteraction = () => {
      elemento.style.transition = "transform 0.2s ease-out"; // Suaviza la entrada
      if (fondoRainbow) fondoRainbow.style.transition = "filter 0.2s ease-out"; // Suaviza la entrada de fondo-rainbow
      if (capaHolograficaEstrellas) capaHolograficaEstrellas.style.transition = "filter 0.2s ease-out";
    
      elemento.addEventListener("mousemove", moverLineas);
      elemento.addEventListener("touchmove", moverLineas);
    };
    
    const stopInteraction = () => {
      elemento.style.transition = "transform 0.6s ease-out"; 
      elemento.style.transform = "rotateY(0deg) rotateX(0deg)";
    
      if (fondoRainbow) {
        fondoRainbow.style.transition = "filter 0.6s ease-out"; 
        fondoRainbow.style.filter = "saturate(10)";
      }
    
      if (capaHolograficaEstrellas) {
        capaHolograficaEstrellas.style.transition = "filter 0.6s ease-out"; 
        capaHolograficaEstrellas.style.filter = "saturate(10)";
      }
    
      elemento.removeEventListener("mousemove", moverLineas);
      elemento.removeEventListener("touchmove", moverLineas);
    };
    

    elemento.addEventListener("mouseenter", startInteraction);
    elemento.addEventListener("touchstart", startInteraction);
    elemento.addEventListener("mouseleave", stopInteraction);
    elemento.addEventListener("touchend", stopInteraction);
  }

  cartas.forEach(aplicarEfectos);
});




// ----------------------------------



/*-------------------------------------ANIMACION DIVS----------------------------------------*/


// animación
function applyAnimations(selector) {
  document.querySelectorAll(selector).forEach((element) => {

    const bgBase = element.getAttribute('data-bg-base');

 
    element.style.backgroundImage = 'none';

   
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const uniqueDelay = Math.random() * 800; 
            setTimeout(() => playAnimation(element, bgBase), uniqueDelay);
          } else {
            
            element.style.backgroundImage = 'none';
          }
        });
      },
      { threshold: 0.5 } 
    );

    observer.observe(element);
  });
}


function playAnimation(element, bgBase) {
  element.style.animation = ''; 


  const totalDuration = 400; 
  const stepDuration = totalDuration / 4; 

  // Secuencia
  setTimeout(() => {
    element.style.backgroundImage = `url(./assets/${bgBase}b.webp)`;
  }, stepDuration * 1); //  al 25% 
  setTimeout(() => {
    element.style.backgroundImage = `url(./assets/${bgBase}c.webp)`;
  }, stepDuration * 2); // al 50% 
  setTimeout(() => {
    element.style.backgroundImage = `url(./assets/${bgBase}d.webp)`;
  }, stepDuration * 3); //  al 75% 
  setTimeout(() => {
    element.style.backgroundImage = `url(./assets/${bgBase}.webp)`; 
  }, totalDuration); // Fondo final 
}

// Aplicar animaciones a estos divs=…
applyAnimations('.carousel-item');





