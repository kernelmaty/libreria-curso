# 📖 Páginas & Almas — Librería Online

Proyecto integrador de Desarrollo Web Frontend. Landing page de una librería argentina ficticia, con **catálogo dinámico, carrito funcional, buscador conectado a una API real y tema claro/oscuro**.

---

## 1. Demo y estructura

```
libreria/
├── index.html          # Estructura semántica (sin CSS ni JS embebido)
├── css/
│   └── styles.css      # Estilos: variables, Flexbox, Grid, tema oscuro, responsive
├── js/
│   └── app.js          # Lógica: render, API, carrito, validación, UI
└── README.md           # Esta documentación
```

> Separación de responsabilidades: estructura (HTML), presentación (CSS) y comportamiento (JS) viven en archivos distintos. La versión anterior tenía el CSS duplicado dentro del `<head>`; eso se eliminó.

---

## 2. Cómo correrlo

El proyecto es 100% estático, sin build. Solo necesitás un servidor local porque el buscador hace `fetch` a una API externa (abrir el HTML con `file://` puede bloquear las peticiones por CORS en algunos navegadores).

```bash
# Opción 1 — Python
python3 -m http.server 8080

# Opción 2 — Node
npx serve .
```

Luego abrir `http://localhost:8080`.

**Deploy:** arrastrar la carpeta a Netlify, o subirla a GitHub y activar GitHub Pages. No requiere configuración extra.

---

## 3. Requisitos de la consigna y cómo se cumplen

### ✅ HTML semántico

- Etiquetas estructurales: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>` (carrito), `<footer>`.
- Cada `<section>` está enlazada a su título con `aria-labelledby`.
- Las reseñas usan `<article>` con `<footer>` interno para la autoría.
- Jerarquía de encabezados correcta: un solo `<h1>` (hero), `<h2>` por sección, `<h3>` en cards y footer.
- **Accesibilidad:** `skip-link` para saltar al contenido, `aria-label` en controles ícono, `aria-live` en zonas que cambian (carrito, búsqueda, feedback del form), `aria-expanded` en el menú mobile, `:focus-visible` estilado, y `prefers-reduced-motion` respetado.

### ✅ CSS avanzado, responsivo, Flexbox y Grid

- **Custom properties (variables):** toda la paleta, tipografía, sombras y radios viven en `:root`. El **tema oscuro** se logra reescribiendo esas variables bajo `html[data-theme="dark"]`.
- **Flexbox** distribuye: el header, el hero, el **catálogo de productos** (`.products-grid` con `flex-wrap` y `flex: 0 1 calc(33.33% - 20px)`), la barra de búsqueda y el footer.
- **Grid** distribuye: la sección de **reseñas** (`.reviews-grid`, 3 columnas con una card destacada que ocupa 2 filas vía `grid-row: 1/3`) y los **resultados de búsqueda** (`grid-template-columns: repeat(auto-fill, minmax(...))`, que se adapta solo).
- **Responsive mobile-first** con tres breakpoints: `1024px` (3→2 columnas), `768px` (menú hamburguesa, todo a 1 columna) y `480px` (ajustes finos de tipografía y padding).
- Funciones modernas: `clamp()` para tipografías fluidas, `color-mix()` para el header translúcido, `aspect-ratio` en portadas, `backdrop-filter` en el header sticky.
- Animaciones con `@keyframes` (libros flotantes, shimmer de skeletons) y transiciones cúbicas reutilizables.

### ✅ JavaScript: interactividad, consumo de API y manipulación del DOM

| Funcionalidad | Detalle técnico |
|---|---|
| **Render dinámico del catálogo** | Los libros son un array de objetos. El JS genera las cards e inyecta el HTML; no están hardcodeadas en el markup. |
| **Filtros** | Botones que re-renderizan el catálogo por género, manipulando el DOM en vivo. |
| **Consumo de API real** | El buscador usa `fetch` contra la **API pública de [Open Library](https://openlibrary.org/developers/api)** (`/search.json`), con `async/await`, manejo de errores y portadas remotas. |
| **Carrito funcional** | Agregar, sumar/restar cantidad, eliminar, total calculado y **persistencia en `localStorage`**. Drawer lateral accesible. |
| **Validación de formulario** | Reglas propias por campo, validación en `blur` y en `submit`, mensajes de error accesibles. |
| **Tema claro/oscuro** | Toggle que persiste la preferencia y respeta `prefers-color-scheme` en la primera visita. |
| **Animación on-scroll** | `IntersectionObserver` revela cards y reseñas al entrar al viewport. |

### ✅ Documentación técnica

Este mismo README, más comentarios en el código explicando cada módulo.

---

## 4. Detalles del desarrollo y decisiones de diseño

### Consumo de la API (Open Library)

Se eligió Open Library por ser **gratuita, sin API key y sin límites estrictos**. La petición pide solo los campos necesarios para ahorrar ancho de banda:

```js
const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=12&fields=title,author_name,first_publish_year,cover_i`;
const res = await fetch(url, { signal: controller.signal });
```

Puntos a destacar:

- **`AbortController`**: si el usuario sigue tecleando, se cancela la petición anterior para no pintar resultados viejos (condición de carrera).
- **`debounce`**: la búsqueda en vivo espera 500 ms tras la última tecla, evitando una request por cada pulsación.
- **Manejo de errores**: si la red falla o la API devuelve un status ≠ 200, se muestra un mensaje claro en vez de romper.
- **Portadas con fallback**: si el libro no tiene `cover_i`, se dibuja una portada generada con la inicial del título.

### Arquitectura del JS

Se usó el **patrón módulo (IIFE)** para encapsular cada responsabilidad (`utils`, `cart`, `catalog`, `search`, `form`, `ui`) sin contaminar el scope global y sin dependencias externas. El arranque es un único listener de `DOMContentLoaded`.

### Manipulación del DOM eficiente

- **Delegación de eventos**: en vez de un listener por botón, se escucha el contenedor (`grid`, `cart-items`, `filters`) y se resuelve el objetivo con `e.target.closest(...)`. Sobrevive al re-render dinámico.
- **`escape()`**: todo dato que se inyecta como HTML pasa por una función que escapa caracteres peligrosos, previniendo XSS (relevante en los resultados de la API).

### Performance y buenas prácticas

- `<script defer>` y `loading="lazy"` en el iframe e imágenes de resultados.
- `preconnect` a Google Fonts.
- Skeletons de carga para evitar saltos de layout (CLS).
- HTML, CSS y JS separados → cacheables de forma independiente.

---

## 5. Tecnologías

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura semántica y accesible |
| CSS3 | Variables, Flexbox, Grid, animaciones, tema oscuro, responsive |
| JavaScript (ES6+) | `fetch`, `async/await`, `IntersectionObserver`, `localStorage`, módulos IIFE |
| Open Library API | Búsqueda de libros en vivo |
| Google Fonts | Playfair Display + Lato |
| YouTube iFrame | Video institucional |

---

## 6. Posibles mejoras a futuro

- Reemplazar el catálogo local por un CMS o backend propio.
- Conectar el formulario a un endpoint real (Formspree o función serverless).
- Agregar paginación e infinite scroll en los resultados de búsqueda.
- Tests con Vitest/Playwright y un linter (ESLint + Prettier).

---

© 2025 — Páginas & Almas · Proyecto educativo de Desarrollo Web Frontend.
