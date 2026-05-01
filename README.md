# 📖 Páginas & Almas — Librería Online

Sitio web de venta de libros desarrollado como proyecto integrador para el curso de Desarrollo Web Frontend.

## 🌐 URL del proyecto

> **[https://paginasyalmas.netlify.app](https://paginasyalmas.netlify.app)**  
> *(Subir a Netlify y reemplazar con la URL real)*

---

## 📋 Descripción

**Páginas & Almas** es una librería online ficticia con una página de venta de libros que permite a los usuarios explorar el catálogo, ver reseñas de clientes y tomar contacto con el equipo. El diseño es responsivo y está pensado para funcionar correctamente en dispositivos móviles, tablets y escritorios.

---

## 🗂️ Estructura de archivos

```
libreria/
│
├── index.html          # Estructura HTML principal (semántica)
├── css/
│   └── styles.css      # Estilos externos con Flexbox, Grid y Media Queries
└── README.md           # Este archivo
```

---

## ✅ Requisitos cumplidos

### 1. Estructura básica de HTML
- Etiquetas semánticas: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
- Contenido dividido en secciones: Inicio (Hero), Video, Productos, Reseñas, Contacto

### 2. Formulario de Contacto
- Campos: nombre, correo electrónico y mensaje
- Integración con **Formspree** para el envío de datos
- Validación nativa con atributos `required`

### 3. Estilos CSS externos
- Archivo `css/styles.css` con:
  - Estilos para `header`, `footer` y lista de navegación
  - Fuentes de **Google Fonts**: Playfair Display + Lato
  - Fondos: colores, gradientes y efectos de superposición

### 4. Diseño Responsivo
- **Flexbox**: Sección "Productos" en cards adaptables (3 columnas → 2 → 1)
- **Grid**: Sección "Reseñas" con distribución en grilla (card destacada en 2 filas)
- **Media Queries**: Breakpoints en 1024px, 768px y 480px para adaptación responsiva

### 5. Contenido multimedia y navegación
- **iframe de YouTube** correctamente integrado en la sección de video
- **Imágenes CSS** (gradientes representando portadas de libros)
- Lista de navegación desordenada con scroll suave a secciones internas

### 6. Subida del proyecto
- Proyecto listo para subir a **Netlify** o **GitHub Pages**
- URL funcional generada tras el deploy

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura semántica |
| CSS3 | Estilos, Flexbox, Grid, Animaciones |
| Google Fonts | Tipografías: Playfair Display + Lato |
| Formspree | Manejo del formulario de contacto |
| YouTube iFrame | Video embebido |
| JavaScript | Menú mobile, scroll suave, animaciones de aparición |

---

## 🚀 Cómo usar este proyecto

1. Clonar o descargar el repositorio
2. Abrir `index.html` en el navegador
3. Para el formulario: reemplazar la URL de Formspree con tu propio endpoint
4. Para publicar en **Netlify**: arrastrar la carpeta del proyecto al panel de Netlify
5. Para **GitHub Pages**: subir el repositorio y activar GitHub Pages desde Settings

---

## 📌 Autor

Proyecto realizado como Pre-Entrega del curso de Desarrollo Web Frontend.  
© 2025 — Páginas & Almas
