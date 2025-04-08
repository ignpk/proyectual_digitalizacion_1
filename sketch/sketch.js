document.addEventListener("DOMContentLoaded", () => {
  // ----------------- CARTAS BLOQUEADAS---------------------------------

  
  
  // Agrega animación a las tarjetas
  document.querySelectorAll(".tarjeta").forEach(t => t.classList.add("flip"));

  const carouselItems = document.querySelectorAll(".carousel-item");
  const fondonegro = document.querySelector(".fondonegro");

  // Oculta carruseles al inicio
  carouselItems.forEach(item => item.style.display = "none");
  fondonegro.style.display = "none";

  // 🔓 1. DESBLOQUEO POR QR
  const params = new URLSearchParams(window.location.search);
  const claveQR = params.get("unlock");
  if (claveQR) {
    const wrapper = document.querySelector(`.carta-wrapper[data-pass="${claveQR}"]`);
    if (wrapper) {
      const overlay = wrapper.querySelector(".overlay-bloqueo");
      if (overlay) overlay.remove();

      // Destello y scroll a la carta
      wrapper.classList.add("destello");
      wrapper.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => wrapper.classList.remove("destello"), 2000);

      // Abrir el carrusel automáticamente
      const boton = wrapper.querySelector(".cartaejemplo");
      if (boton) {
        const id = boton.getAttribute("data-target");
        const itemToShow = document.getElementById(id);
        if (itemToShow) {
          carouselItems.forEach(item => item.style.display = "none");
          itemToShow.style.display = "flex";
          fondonegro.style.display = "block";
          document.body.style.overflow = "hidden";
        }
      }
    }
  }

  // ✅ 2. AGREGAMOS EVENTO A TODOS LOS OVERLAYS PARA PEDIR CONTRASEÑA
  document.querySelectorAll(".overlay-bloqueo").forEach(overlay => {
    overlay.addEventListener("click", e => {
      e.stopPropagation();

      const wrapper = overlay.closest(".carta-wrapper");
      const passCorrecta = wrapper.getAttribute("data-pass");
      const passIngresada = prompt("Introduce la contraseña:");

      if (passIngresada === passCorrecta) {
        overlay.remove();

        // Abre el carrusel asociado
        const boton = wrapper.querySelector(".cartaejemplo");
        if (boton) {
          const id = boton.getAttribute("data-target");
          const itemToShow = document.getElementById(id);
          if (itemToShow) {
            carouselItems.forEach(item => item.style.display = "none");
            itemToShow.style.display = "flex";
            fondonegro.style.display = "block";
            document.body.style.overflow = "hidden";
          }
        }
      } else {
        alert("Contraseña incorrecta");
      }
    });
  });

  // ✅ 3. Si ya está desbloqueada, clic abre directamente
  document.querySelectorAll(".cartaejemplo").forEach(boton => {
    boton.addEventListener("click", event => {
      event.stopPropagation();

      const wrapper = boton.closest(".carta-wrapper");
      const overlay = wrapper.querySelector(".overlay-bloqueo");

      if (!overlay) {
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




// ----------------- ESCANER QR---------------------------------


function iniciarScanner() {
  document.getElementById("reader-container").style.display = "block";

  const html5QrCode = new Html5Qrcode("reader");

  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    qrCodeMessage => {
      console.log("QR detectado:", qrCodeMessage);
      
      html5QrCode.stop().then(() => {
        console.log("Escáner detenido, redirigiendo...");

        // ✅ CAMBIO CLAVE AQUÍ
        window.location.replace(`?unlock=${encodeURIComponent(qrCodeMessage)}`);

      }).catch(err => {
        console.error("Error al detener el escáner:", err);

        // Fallback igual
        window.location.replace(`?unlock=${encodeURIComponent(qrCodeMessage)}`);
      });
    },
    errorMessage => {
      // En silencio mientras escanea
    }
  ).catch(err => {
    console.error("No se pudo iniciar el escáner:", err);
  });
}

// ----------------- BANNER FOTOS -----------------



document.addEventListener("DOMContentLoaded", function () {
  const banner = document.querySelector('.banner');
  let currentImageIndex = 0;
  let bannerImages = [];
  let intervalId;
  let isMobileMode = null; // guardamos si estamos en modo mobile

  // Función para elegir el set de imágenes según el ancho de pantalla
  function getBannerImages(isMobile) {
    return isMobile
      ? [
          'assets/wallpapersMobile01.webp',
          'assets/wallpapersMobile02.webp',
          'assets/wallpapersMobile03.webp',
          'assets/wallpapersMobile04.webp',
        ]
      : [
          'assets/wallpapers.webp',
          'assets/wallpapers02.webp',
          'assets/wallpapers03.webp',
          'assets/wallpapers04.webp',
        ];
  }

  // Precargar imágenes
  function preloadImages(images) {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }

  // Cambiar imagen de fondo
  function changeBannerImage() {
    banner.style.backgroundImage = `url(${bannerImages[currentImageIndex]})`;
    currentImageIndex = (currentImageIndex + 1) % bannerImages.length;
  }

  // Iniciar carrusel
  function startCarousel() {
    clearInterval(intervalId); // Detener intervalos anteriores
    isMobileMode = window.innerWidth <= 500; // actualizar el estado
    bannerImages = getBannerImages(isMobileMode);
    preloadImages(bannerImages);
    currentImageIndex = 0;
    changeBannerImage(); // Mostrar la primera imagen
    intervalId = setInterval(changeBannerImage, 7000);
  }

  // Al cargar la página
  startCarousel();

  // Al redimensionar la ventana
  window.addEventListener('resize', () => {
    const nowMobile = window.innerWidth <= 500;
    if (nowMobile !== isMobileMode) {
      startCarousel(); // reiniciar con las imágenes correctas
    }
  });
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
      elemento.style.transition = "transform 0.6s ease-out"; // Suaviza la salida
      elemento.style.transform = "rotateY(0deg) rotateX(0deg)";
    
      if (fondoRainbow) {
        fondoRainbow.style.transition = "filter 0.6s ease-out"; // Suaviza la salida de fondo-rainbow
        fondoRainbow.style.filter = "saturate(10)";
      }
    
      if (capaHolograficaEstrellas) {
        capaHolograficaEstrellas.style.transition = "filter 0.6s ease-out"; // Suaviza la salida de capaHolograficaEstrellas
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

// reproducir la animación
function playAnimation(element, bgBase) {
  element.style.animation = ''; 

  // Duración de la animación
  const totalDuration = 400; // 0.5s
  const stepDuration = totalDuration / 4; 

  // Secuencia
  setTimeout(() => {
    element.style.backgroundImage = `url(./assets/${bgBase}b.webp)`;
  }, stepDuration * 1); // Cambiar al 25% del tiempo total
  setTimeout(() => {
    element.style.backgroundImage = `url(./assets/${bgBase}c.webp)`;
  }, stepDuration * 2); // Cambiar al 50% del tiempo total
  setTimeout(() => {
    element.style.backgroundImage = `url(./assets/${bgBase}d.webp)`;
  }, stepDuration * 3); // Cambiar al 75% del tiempo total
  setTimeout(() => {
    element.style.backgroundImage = `url(./assets/${bgBase}.webp)`; // Fondo final
  }, totalDuration); // Fondo final al terminar la animación
}

// Aplicar animaciones a estos divs
applyAnimations('.carousel-item');





