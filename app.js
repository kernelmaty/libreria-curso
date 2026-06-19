/* =========================================================
   PÁGINAS & ALMAS — app.js
   Vanilla JS (sin dependencias). Patrón de módulos por IIFE.
   Módulos:
   - utils        helpers (formato de precio, debounce, escape HTML, toast)
   - catalog      render dinámico del catálogo + filtros
   - cart         estado del carrito + drawer + persistencia
   - search       consumo de la API pública de Open Library
   - form         validación progresiva del formulario de contacto
   - ui           menú mobile, tema, scroll suave, animaciones on-scroll
   ========================================================= */
'use strict';

/* ---------------- UTILS ---------------- */
const utils = (() => {
  // Formato de moneda argentina
  const fmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
  const money = (n) => fmt.format(n);

  // Evita ejecutar una función en cada tecla; espera a que el usuario pare
  const debounce = (fn, delay = 400) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
  };

  // Escapa texto antes de inyectarlo como HTML (previene XSS)
  const escape = (str = '') => String(str).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  // Toast efímero accesible
  let toastTimer;
  const toast = (msg) => {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  };

  return { money, debounce, escape, toast };
})();

/* ---------------- DATOS DEL CATÁLOGO ----------------
   En una app real vendrían de una API/CMS. Acá los modelamos
   como datos para poder renderizarlos dinámicamente y filtrarlos. */
const BOOKS = [
  { id: 1, title: 'Cien años de soledad', author: 'Gabriel García Márquez', genre: 'Novela', price: 4500, rating: 5, badge: 'Más vendido', initial: 'CE', cover: 'linear-gradient(135deg,#8B2635,#C0392B)' },
  { id: 2, title: 'El Aleph', author: 'Jorge Luis Borges', genre: 'Cuento', price: 3800, rating: 5, badge: null, initial: 'EA', cover: 'linear-gradient(135deg,#1A3A5C,#2980B9)' },
  { id: 3, title: 'Rayuela', author: 'Julio Cortázar', genre: 'Novela', price: 4200, rating: 4, badge: 'Nuevo', initial: 'R', cover: 'linear-gradient(135deg,#2C5F2E,#388E3C)' },
  { id: 4, title: 'Santa Evita', author: 'Tomás Eloy Martínez', genre: 'Novela', price: 3600, rating: 4, badge: null, initial: 'SE', cover: 'linear-gradient(135deg,#5D4037,#8D6E63)' },
  { id: 5, title: 'Ficciones', author: 'Jorge Luis Borges', genre: 'Cuento', price: 2900, oldPrice: 4000, rating: 5, badge: 'Oferta', initial: 'F', cover: 'linear-gradient(135deg,#4A148C,#7B1FA2)' },
  { id: 6, title: 'Los Raros', author: 'Rubén Darío', genre: 'Poesía', price: 2800, rating: 4, badge: null, initial: 'LR', cover: 'linear-gradient(135deg,#E65100,#F57C00)' },
  { id: 7, title: 'El idioma de los argentinos', author: 'Jorge Luis Borges', genre: 'Ensayo', price: 3100, rating: 4, badge: null, initial: 'IA', cover: 'linear-gradient(135deg,#37474F,#607D8B)' },
  { id: 8, title: 'Las mil y una noches', author: 'Anónimo', genre: 'Cuento', price: 5200, rating: 5, badge: null, initial: 'MN', cover: 'linear-gradient(135deg,#AD1457,#D81B60)' },
];

/* ---------------- CARRITO ---------------- */
const cart = (() => {
  const KEY = 'pya_cart';
  let items = [];

  const load = () => { try { items = JSON.parse(localStorage.getItem(KEY)) || []; } catch { items = []; } };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* modo privado: ignorar */ } };

  const count = () => items.reduce((acc, i) => acc + i.qty, 0);
  const total = () => items.reduce((acc, i) => acc + i.price * i.qty, 0);

  const add = (book) => {
    const found = items.find((i) => i.id === book.id);
    if (found) found.qty += 1;
    else items.push({ id: book.id, title: book.title, price: book.price, cover: book.cover, initial: book.initial, qty: 1 });
    save(); render();
    utils.toast(`"${book.title}" agregado al carrito`);
  };

  const changeQty = (id, delta) => {
    const it = items.find((i) => i.id === id);
    if (!it) return;
    it.qty += delta;
    if (it.qty <= 0) items = items.filter((i) => i.id !== id);
    save(); render();
  };

  const remove = (id) => { items = items.filter((i) => i.id !== id); save(); render(); };

  // Render del badge + drawer (manipulación del DOM)
  const render = () => {
    const badge = document.getElementById('cart-count');
    const c = count();
    badge.textContent = c;
    badge.classList.toggle('has-items', c > 0);

    const list = document.getElementById('cart-items');
    if (items.length === 0) {
      list.innerHTML = '<p class="cart-empty">Tu carrito está vacío.<br>¡Sumá tu próxima lectura!</p>';
    } else {
      list.innerHTML = items.map((i) => `
        <div class="cart-item" data-id="${i.id}">
          <div class="cart-item-cover" style="background:${i.cover}">${utils.escape(i.initial)}</div>
          <div class="cart-item-info">
            <div class="cart-item-title">${utils.escape(i.title)}</div>
            <div class="cart-item-price">${utils.money(i.price)}</div>
            <div class="cart-qty">
              <button data-act="dec" aria-label="Quitar uno">−</button>
              <span>${i.qty}</span>
              <button data-act="inc" aria-label="Agregar uno">+</button>
            </div>
          </div>
          <button class="cart-item-remove" data-act="remove" aria-label="Eliminar">🗑️</button>
        </div>`).join('');
    }
    document.getElementById('cart-total').textContent = utils.money(total());
  };

  const open = () => {
    document.getElementById('cart-drawer').classList.add('open');
    document.getElementById('cart-drawer').setAttribute('aria-hidden', 'false');
    const ov = document.getElementById('cart-overlay');
    ov.hidden = false; requestAnimationFrame(() => ov.classList.add('open'));
  };
  const close = () => {
    document.getElementById('cart-drawer').classList.remove('open');
    document.getElementById('cart-drawer').setAttribute('aria-hidden', 'true');
    const ov = document.getElementById('cart-overlay');
    ov.classList.remove('open');
    setTimeout(() => { ov.hidden = true; }, 300);
  };

  const init = () => {
    load(); render();
    document.getElementById('cart-toggle').addEventListener('click', open);
    document.getElementById('cart-close').addEventListener('click', close);
    document.getElementById('cart-overlay').addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

    // Delegación de eventos en la lista del carrito
    document.getElementById('cart-items').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const id = Number(btn.closest('.cart-item').dataset.id);
      const act = btn.dataset.act;
      if (act === 'inc') changeQty(id, 1);
      else if (act === 'dec') changeQty(id, -1);
      else if (act === 'remove') remove(id);
    });

    document.getElementById('cart-checkout').addEventListener('click', () => {
      if (count() === 0) { utils.toast('Tu carrito está vacío'); return; }
      utils.toast(`¡Gracias! Compra simulada por ${utils.money(total())}`);
      items = []; save(); render(); close();
    });
  };

  return { init, add };
})();

/* ---------------- CATÁLOGO ---------------- */
const catalog = (() => {
  const grid = () => document.getElementById('products-grid');

  const cardHTML = (b) => `
    <article class="product-card" data-genre="${utils.escape(b.genre)}">
      ${b.badge ? `<span class="card-badge">${utils.escape(b.badge)}</span>` : ''}
      <div class="card-cover" style="background:${b.cover}">
        <span class="cover-initial">${utils.escape(b.initial)}</span>
      </div>
      <div class="card-body">
        <p class="card-genre">${utils.escape(b.genre)}</p>
        <h3 class="card-title">${utils.escape(b.title)}</h3>
        <p class="card-author">${utils.escape(b.author)}</p>
        <p class="card-rating" aria-label="${b.rating} de 5 estrellas">${'★'.repeat(b.rating)}${'☆'.repeat(5 - b.rating)}</p>
        <p class="card-price">${b.oldPrice ? `<s>${utils.money(b.oldPrice)}</s>` : ''}${utils.money(b.price)}</p>
        <button class="btn-card" data-add="${b.id}">Agregar al carrito 🛒</button>
      </div>
    </article>`;

  const render = (list) => {
    grid().innerHTML = list.map(cardHTML).join('');
    ui.observeCards(); // re-observa las nuevas cards para la animación
  };

  const filter = (genre) => {
    render(genre === 'all' ? BOOKS : BOOKS.filter((b) => b.genre === genre));
  };

  const init = () => {
    // Skeletons mientras "carga"
    grid().innerHTML = Array.from({ length: 6 }, () => '<div class="skeleton"></div>').join('');

    // Simula latencia de red y luego renderiza
    setTimeout(() => render(BOOKS), 500);

    // Filtros (delegación)
    document.querySelector('.filters').addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      filter(btn.dataset.filter);
    });

    // Agregar al carrito (delegación sobre el grid)
    grid().addEventListener('click', (e) => {
      const btn = e.target.closest('[data-add]');
      if (!btn) return;
      const book = BOOKS.find((b) => b.id === Number(btn.dataset.add));
      if (book) cart.add(book);
    });
  };

  return { init };
})();

/* ---------------- BUSCADOR (API Open Library) ---------------- */
const search = (() => {
  const API = 'https://openlibrary.org/search.json';
  const COVER = (id) => `https://covers.openlibrary.org/b/id/${id}-M.jpg`;
  let controller = null; // para cancelar peticiones anteriores

  const status = (msg) => { document.getElementById('search-status').textContent = msg; };

  const render = (docs) => {
    const box = document.getElementById('search-results');
    if (!docs.length) { box.innerHTML = ''; status('No encontramos resultados. Probá con otro término.'); return; }
    box.innerHTML = docs.map((d) => {
      const title = utils.escape(d.title || 'Sin título');
      const author = utils.escape((d.author_name && d.author_name[0]) || 'Autor desconocido');
      const year = d.first_publish_year ? `<p class="result-year">${d.first_publish_year}</p>` : '';
      const cover = d.cover_i
        ? `<img class="result-cover" src="${COVER(d.cover_i)}" alt="Portada de ${title}" loading="lazy" />`
        : `<div class="result-cover-fallback">${title.charAt(0)}</div>`;
      return `
        <article class="result-card">
          ${cover}
          <div class="result-body">
            <p class="result-title">${title}</p>
            <p class="result-author">${author}</p>
            ${year}
          </div>
        </article>`;
    }).join('');
    status(`${docs.length} resultado(s) para tu búsqueda.`);
  };

  const run = async (query) => {
    const q = query.trim();
    if (q.length < 2) { status('Escribí al menos 2 caracteres.'); return; }

    // Cancela la búsqueda anterior si seguía en vuelo
    if (controller) controller.abort();
    controller = new AbortController();

    status('Buscando…');
    document.getElementById('search-results').innerHTML = '';

    try {
      const url = `${API}?q=${encodeURIComponent(q)}&limit=12&fields=title,author_name,first_publish_year,cover_i`;
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      render(data.docs || []);
    } catch (err) {
      if (err.name === 'AbortError') return; // búsqueda reemplazada, no es error real
      console.error('Error de búsqueda:', err);
      status('Hubo un problema al conectar con la API. Reintentá en unos segundos.');
    }
  };

  const init = () => {
    const input = document.getElementById('search-input');
    const btn = document.getElementById('search-btn');

    btn.addEventListener('click', () => run(input.value));
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(input.value); });
    // Búsqueda en vivo con debounce
    input.addEventListener('input', utils.debounce(() => { if (input.value.trim().length >= 3) run(input.value); }, 500));
  };

  return { init };
})();

/* ---------------- FORMULARIO DE CONTACTO ---------------- */
const form = (() => {
  const rules = {
    nombre: (v) => v.trim().length >= 2 || 'Ingresá tu nombre (mínimo 2 caracteres).',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Ingresá un correo válido.',
    mensaje: (v) => v.trim().length >= 10 || 'Tu mensaje debe tener al menos 10 caracteres.',
  };

  const setError = (field, msg) => {
    const input = document.getElementById(field);
    const group = input.closest('.form-group');
    const err = document.querySelector(`.field-error[data-for="${field}"]`);
    group.classList.toggle('has-error', !!msg);
    err.textContent = msg || '';
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };

  const validateField = (field, value) => {
    const result = rules[field](value);
    const ok = result === true;
    setError(field, ok ? '' : result);
    return ok;
  };

  const init = () => {
    const el = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');

    // Validación al salir de cada campo
    ['nombre', 'email', 'mensaje'].forEach((f) => {
      document.getElementById(f).addEventListener('blur', (e) => validateField(f, e.target.value));
    });

    el.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = { nombre: el.nombre.value, email: el.email.value, mensaje: el.mensaje.value };
      const valid = Object.keys(rules).every((f) => validateField(f, data[f]));

      if (!valid) {
        feedback.textContent = 'Revisá los campos marcados.';
        feedback.className = 'form-feedback err';
        return;
      }
      // Envío simulado (acá iría un fetch POST a Formspree o backend propio)
      feedback.textContent = '¡Gracias! Tu mensaje fue enviado. Te responderemos pronto. ✉️';
      feedback.className = 'form-feedback ok';
      el.reset();
      utils.toast('Mensaje enviado correctamente');
    });
  };

  return { init };
})();

/* ---------------- UI GENERAL ---------------- */
const ui = (() => {
  let cardObserver;

  // Anima cards y reseñas cuando entran al viewport
  const observeCards = () => {
    if (!cardObserver) {
      cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 70);
            cardObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });
    }
    document.querySelectorAll('.product-card:not(.visible), .review-card:not(.visible)')
      .forEach((el) => cardObserver.observe(el));
  };

  const initMenu = () => {
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    // Scroll suave + cierre del menú al navegar
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
          nav.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  };

  const initTheme = () => {
    const btn = document.getElementById('theme-toggle');
    const root = document.documentElement;
    const saved = (() => { try { return localStorage.getItem('pya_theme'); } catch { return null; } })();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const apply = (theme) => {
      root.setAttribute('data-theme', theme);
      btn.querySelector('span').textContent = theme === 'dark' ? '☀️' : '🌙';
    };
    apply(saved || (prefersDark ? 'dark' : 'light'));
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem('pya_theme', next); } catch { /* ignore */ }
    });
  };

  const init = () => { initMenu(); initTheme(); observeCards(); };

  return { init, observeCards };
})();

/* ---------------- ARRANQUE ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  ui.init();
  cart.init();
  catalog.init();
  search.init();
  form.init();
});
