/* ============================================================
   1) Iconos flotantes (iconos rebotando estilo protector de pantalla)
   ============================================================ */
(function () {
  const icons = document.getElementById("bubblesIcons");
  if (!icons) return;
  const ctx = icons.getContext("2d");

  const RUTAS_ICONOS = [
    "img/icon/icon-code.png",
    "img/icon/icon-css3.png",
    "img/icon/Icon-GitHub.png",
    "img/icon/Icon-HTML.png",
    "img/icon/icon-Java.png",
    "img/icon/Icon-JavaScript.png",
    "img/icon/icon-nodejs.png",
    "img/icon/icon-sql.png",
    "img/icon/icon-vsc.png",
  ];

  let bubbles = [];
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let ancho, alto;

  function resize() {
    ancho = window.innerWidth;
    alto = window.innerHeight;
    icons.width = ancho * dpr;
    icons.height = alto * dpr;
    icons.style.width = ancho + "px";
    icons.style.height = alto + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function tamanoIcono() {
    const base = Math.min(ancho, alto);
    return Math.max(30, Math.min(base * 0.07, 100));
  }

  function cantidadIconos() {
    if (ancho < 600) return 4;
    if (ancho < 1200) return 6;
    return RUTAS_ICONOS.length;
  }

  class Burbuja {
    constructor(img) {
      const size = tamanoIcono();
      this.img = img;
      this.size = size;
      this.x = Math.random() * (ancho - size) + size / 2;
      this.y = Math.random() * (alto - size) + size / 2;
      const velBase = Math.min(ancho, alto) * 0.000055;
      const angulo = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angulo) * (velBase + Math.random() * velBase);
      this.vy = Math.sin(angulo) * (velBase + Math.random() * velBase);
    }

    actualizar(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      const r = this.size / 2;
      if (this.x - r <= 0) { this.x = r; this.vx *= -1; }
      if (this.x + r >= ancho) { this.x = ancho - r; this.vx *= -1; }
      if (this.y - r <= 0) { this.y = r; this.vy *= -1; }
      if (this.y + r >= alto) { this.y = alto - r; this.vy *= -1; }
    }

    dibujar() {
      ctx.save();
      ctx.globalAlpha = 0.32;
      ctx.drawImage(this.img, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  function resolverColision(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const minDist = (a.size + b.size) / 2;

    if (dist < minDist && dist > 0) {
      const overlap = (minDist - dist) / 2;
      const nx = dx / dist;
      const ny = dy / dist;
      a.x -= nx * overlap;
      a.y -= ny * overlap;
      b.x += nx * overlap;
      b.y += ny * overlap;
      [a.vx, b.vx] = [b.vx, a.vx];
      [a.vy, b.vy] = [b.vy, a.vy];
    }
  }

  function crearBurbujas() {
    const cantidad = cantidadIconos();
    const rutas = RUTAS_ICONOS.slice(0, cantidad);
    return Promise.all(
      rutas.map(
        (ruta) =>
          new Promise((resolve) => {
            const img = new Image();
            img.src = ruta;
            img.onload = () => resolve(new Burbuja(img));
            img.onerror = () => resolve(null);
          })
      )
    ).then((arr) => arr.filter(Boolean));
  }

  let ultimoTiempo = performance.now();

  function animar(t) {
    const dt = Math.min(t - ultimoTiempo, 32);
    ultimoTiempo = t;
    ctx.clearRect(0, 0, ancho, alto);
    bubbles.forEach((b) => b.actualizar(dt));
    for (let i = 0; i < bubbles.length; i++) {
      for (let j = i + 1; j < bubbles.length; j++) {
        resolverColision(bubbles[i], bubbles[j]);
      }
    }
    bubbles.forEach((b) => b.dibujar());
    requestAnimationFrame(animar);
  }

  function iniciar() {
    resize();
    crearBurbujas().then((arr) => {
      bubbles = arr;
      requestAnimationFrame(animar);
    });
  }

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resize();
      bubbles.forEach((b) => {
        b.size = tamanoIcono();
        b.x = Math.min(b.x, ancho - b.size / 2);
        b.y = Math.min(b.y, alto - b.size / 2);
      });
    }, 150);
  });

  document.addEventListener("DOMContentLoaded", iniciar);
})();


/* ============================================================
   2) Animación de texto letra por letra (re-disparable)
   ============================================================ */
function animarTextoLetraPorLetra(elementoId, delayInicial = 0.001, incremento = 0.0015) {
  const contenedor = document.getElementById(elementoId);
  if (!contenedor) return;

  if (!contenedor.dataset.textoOriginal) {
    contenedor.dataset.textoOriginal = contenedor.textContent.trim();
  }
  const texto = contenedor.dataset.textoOriginal;
  contenedor.textContent = "";

  [...texto].forEach((caracter, index) => {
    const span = document.createElement("span");
    span.classList.add("kl-feat__desc-char");
    if (caracter === " ") {
      span.classList.add("is-space");
      span.innerHTML = "&nbsp;";
    } else {
      span.textContent = caracter;
    }
    span.style.animationDelay = `${delayInicial + index * incremento}s`;
    contenedor.appendChild(span);
  });
}

function animarTodosLosTextosHero() {
  ["textoAnimado1", "textoAnimado2", "textoAnimado3"].forEach((id) =>
    animarTextoLetraPorLetra(id)
  );
}


/* ============================================================
   3) Navegación por secciones — MODELO UNIFICADO
   ------------------------------------------------------------
   Una pantalla = una sección, tanto en escritorio como en
   táctil. Ya no existe scroll libre en ningún dispositivo; la
   única forma de cambiar de sección es a través de irASeccion(),
   disparada por:
     - la rueda del mouse (escritorio),
     - un clic en la flecha del Hero (escritorio y táctil),
     - un clic en el nav / menú móvil,
     - un swipe rápido y decidido (táctil).
   Al eliminar el scroll natural también desaparece el
   IntersectionObserver de revelado progresivo que existía antes:
   ya no hace falta, porque nunca se puede "entrar a medias" a
   una sección — siempre se llega completa, vía animarEntrada().
   ============================================================ */
const ORDEN_SECCIONES = ["hero", "projects", "skills", "about", "contact"];
const DURACION_SCROLL = 400; // ms — súbelo para más lento, bájalo para más rápido

// Lo que importa no es el ancho de pantalla sino si el dispositivo
// tiene mouse/rueda real (escritorio) o es táctil (móvil, tablet,
// iPad, sin importar qué tan grande sea la pantalla).
const ES_TACTIL = window.matchMedia("(hover: none), (pointer: coarse)").matches;

function esEscritorio() {
  return !ES_TACTIL;
}

function animarEntrada(seccionId) {
  const elementos = document.querySelectorAll(
    `#${seccionId} .card,
     #${seccionId} h2,
     #${seccionId} h3,
     #${seccionId} p,
     #${seccionId} form,
     #${seccionId} .skill-box,
     #${seccionId} .skills-group,
     #${seccionId} .info-item,
     #${seccionId} .btn-hero,
     #${seccionId} .footer-bottom`
  );

  gsap.fromTo(
    elementos,
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
  );

  if (seccionId === "hero") {
    animarTodosLosTextosHero();
  }
}

function animarSalida(seccionId, callback) {
  const elementos = document.querySelectorAll(
    `#${seccionId} .card,
     #${seccionId} h2,
     #${seccionId} h3,
     #${seccionId} p,
     #${seccionId} form,
     #${seccionId} .skill-box,
     #${seccionId} .skills-group,
     #${seccionId} .info-item,
     #${seccionId} .btn-hero,
     #${seccionId} .footer-bottom`
  );

  if (!elementos.length) {
    callback();
    return;
  }

  gsap.to(elementos, {
    opacity: 0,
    y: -30,
    duration: 0.25,
    stagger: 0.04,
    ease: "power2.in",
    onComplete: callback,
  });
}

const paginasWrapper = document.getElementById("paginasWrapper");
let seccionActual = 0; // índice dentro de ORDEN_SECCIONES

function seccionActualIndex() {
  return seccionActual;
}

function moverASeccion(direccion) {
  const siguiente = Math.min(
    ORDEN_SECCIONES.length - 1,
    Math.max(0, seccionActual + direccion)
  );
  if (siguiente === seccionActual) return; // ya está en el primer/último tramo, no hace nada
  irASeccion(ORDEN_SECCIONES[siguiente]);
}

// Coordina salida → desplazamiento (transform) → entrada.
// Ya NO se usa window.scrollTo: el documento (html/body) no tiene
// scroll propio, así que la única forma de "moverse" es animar el
// transform de #paginasWrapper. Esto es justo lo que hace posible
// bloquear de verdad el arrastre táctil nativo.
let transicionEnCurso = false;

function altoSeccion() {
  const primera = document.getElementById(ORDEN_SECCIONES[0]);
  return primera ? primera.getBoundingClientRect().height : window.innerHeight;
}

function irASeccion(id, duracion = DURACION_SCROLL) {
  if (transicionEnCurso) return; // evita solapar dos transiciones
  const indiceDestino = ORDEN_SECCIONES.indexOf(id);
  if (indiceDestino === -1 || !paginasWrapper) return;

  const actualId = ORDEN_SECCIONES[seccionActual];
  if (actualId === id) return;

  transicionEnCurso = true;

  animarSalida(actualId, () => {
    const alto = altoSeccion();
    const inicioY = -seccionActual * alto;
    const finY = -indiceDestino * alto;
    const distancia = finY - inicioY;
    const inicioTiempo = performance.now();

    function paso(ahora) {
      const transcurrido = ahora - inicioTiempo;
      const progreso = Math.min(transcurrido / duracion, 1);
      const facilitado = 1 - Math.pow(1 - progreso, 3); // easeOutCubic
      paginasWrapper.style.transform = `translateY(${inicioY + distancia * facilitado}px)`;
      if (progreso < 1) {
        requestAnimationFrame(paso);
      } else {
        seccionActual = indiceDestino;
        animarEntrada(id);
        transicionEnCurso = false;
      }
    }
    requestAnimationFrame(paso);
  });
}

// Si cambia el alto de la ventana (rotar el celular, teclado
// virtual, etc.) reposiciona el wrapper sin animación para que
// siga alineado con la sección actual.
window.addEventListener("resize", () => {
  if (!paginasWrapper || transicionEnCurso) return;
  paginasWrapper.style.transform = `translateY(${-seccionActual * altoSeccion()}px)`;
});

// --- Rueda del mouse: solo en escritorio salta una sección completa por "golpe" ---
let scrollBloqueado = false;
window.addEventListener(
  "wheel",
  (e) => {
    if (!esEscritorio()) return; // en táctil el cambio de sección va por swipe, no por wheel
    e.preventDefault();
    if (scrollBloqueado) return;
    scrollBloqueado = true;

    const direccion = e.deltaY > 0 ? 1 : -1;
    moverASeccion(direccion);

    setTimeout(() => {
      scrollBloqueado = false;
    }, DURACION_SCROLL + 150);
  },
  { passive: false }
);

// --- Clicks del nav (escritorio y móvil): bajan suavemente ---
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const id = link.getAttribute("href").slice(1);
    cerrarMenuMobile();
    irASeccion(id);
  });
});

// --- Botones de scroll manual (arriba/abajo) en TODAS las
// secciones: para quien no quiera usar la rueda, no la tenga,
// o no quiera hacer swipe en táctil ---
document.querySelectorAll(".scroll-nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const direccion = parseInt(btn.dataset.dir, 10) || 1;
    moverASeccion(direccion);
  });
});


/* ============================================================
   4) Animación inicial del Hero al cargar la página
   ============================================================ */
window.addEventListener("DOMContentLoaded", () => {
  animarTodosLosTextosHero();
});


/* ============================================================
   5) Menú móvil (hamburguesa)
   ============================================================ */
const navToggle = document.getElementById("navToggle");
const navMobile = document.getElementById("navMobile");

function cerrarMenuMobile() {
  if (!navToggle || !navMobile) return;
  navToggle.classList.remove("activo");
  navMobile.classList.remove("activo");
  navToggle.setAttribute("aria-expanded", "false");
}

if (navToggle && navMobile) {
  navToggle.addEventListener("click", () => {
    const abierto = navMobile.classList.toggle("activo");
    navToggle.classList.toggle("activo", abierto);
    navToggle.setAttribute("aria-expanded", String(abierto));
  });
}


/* ============================================================
   6) Footer: año actual
   ============================================================ */
const footerYear = document.getElementById("footerYear");
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}


/* ============================================================
   7) Conexión del formulario a EmailJS
   ============================================================ */
(function () {
  if (typeof emailjs === "undefined") return;
  emailjs.init("TU_PUBLIC_KEY"); // Reemplaza con tu Public Key de EmailJS
})();

const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    emailjs.sendForm("TU_SERVICE_ID", "TU_TEMPLATE_ID", this).then(
      () => {
        alert("Mensaje enviado correctamente ✅");
        this.reset();
      },
      (error) => {
        alert("Error al enviar ❌: " + JSON.stringify(error));
      }
    );
  });
}


/* ============================================================
   8) Soporte táctil (móvil, tablet, iPad): la sección se
   mantiene estática (sin scroll libre — ver punto 10 de
   styles.css). El único gesto que cambia de sección es un swipe
   decidido: sostener y deslizar rápido hacia arriba o abajo.
   Un arrastre lento/indeciso ya NO hace nada, porque no hay
   scroll nativo que seguir — así se elimina la doble animación
   que antes competía entre el scroll natural y el swipe.
   ============================================================ */
if (ES_TACTIL) {
  let inicioToqueY = 0;
  let inicioToqueTiempo = 0;

  window.addEventListener(
    "touchstart",
    (e) => {
      inicioToqueY = e.touches[0].clientY;
      inicioToqueTiempo = Date.now();
    },
    { passive: true }
  );

  window.addEventListener(
    "touchend",
    (e) => {
      const finToqueY = e.changedTouches[0].clientY;
      const distancia = inicioToqueY - finToqueY;
      const tiempo = Date.now() - inicioToqueTiempo;

      // Solo un gesto deliberado (rápido y con recorrido) cambia de
      // sección; cualquier otro toque/arrastre no hace nada, ya que
      // no hay scroll nativo de por medio.
      if (Math.abs(distancia) > 60 && tiempo < 600) {
        moverASeccion(distancia > 0 ? 1 : -1);
      }
    },
    { passive: true }
  );
}