document.addEventListener('DOMContentLoaded', function() {
  // URLs de las hojas de Google Sheets
  const configUrl = 'https://docs.google.com/spreadsheets/d/1wjs6v965MknQsMIa3qFK3FzQ6_pB9ae_1JX5M9JZf60/gviz/tq?tqx=out:json&gid=1159464185';
  const productsUrl = 'https://docs.google.com/spreadsheets/d/1wjs6v965MknQsMIa3qFK3FzQ6_pB9ae_1JX5M9JZf60/gviz/tq?tqx=out:json&gid=0';
  const categoriesUrl = 'https://docs.google.com/spreadsheets/d/1wjs6v965MknQsMIa3qFK3FzQ6_pB9ae_1JX5M9JZf60/gviz/tq?tqx=out:json&gid=1689458163';
  
  // Para evitar caché, generamos URLs con un parámetro único
  const configUrlNoCache = configUrl + '&_ts=' + Date.now();
  const productsUrlNoCache = productsUrl + '&_ts=' + Date.now();
  const categoriesUrlNoCache = categoriesUrl + '&_ts=' + Date.now();

  /* ===============================
     1. Carga y aplicación de la Configuración
  =============================== */
  fetch(configUrlNoCache)
    .then(response => response.text())
    .then(text => {
      // El texto viene envuelto en una llamada a función, se extrae el JSON interno
      const jsonString = text.substring(text.indexOf('(') + 1, text.lastIndexOf(')'));
      const configData = JSON.parse(jsonString);
      const rows = configData.table.rows;
      const config = {};
      // Se asume que la primera columna es la clave y la segunda el valor
      rows.forEach(row => {
        const key = row.c[0]?.v;
        const value = row.c[1]?.v;
        if(key) {
          config[key.toLowerCase()] = value;
        }
      });
      applyConfig(config);
    })
    .catch(error => {
      console.error('Error fetching config:', error);
    });



  fetch(categoriesUrlNoCache)
    .then(response => response.text())
    .then(text => {
      // Extraer el JSON interno de la respuesta
      const jsonString = text.substring(text.indexOf('(') + 1, text.lastIndexOf(')'));
      const categoriesData = JSON.parse(jsonString);
      const rows = categoriesData.table.rows;
      // Se asume que cada fila tiene la categoría en la primera celda
      const categories = rows.map(row => row.c[0]?.v).filter(v => v);
      
      // Selecciona el contenedor donde se insertarán los botones
      const tabsContainer = document.getElementById('tabs-container');
      
      categories.forEach((cat, index) => {
        // Crear el botón de la categoría
        const btn = document.createElement('button');
        btn.classList.add('tab-button');
        if (index === 0) btn.classList.add('active');  // La primera categoría se activa por defecto
        btn.textContent = cat;
        btn.setAttribute('data-tab', cat);
        
        // Agregar el event listener para cambiar de pestaña
        btn.addEventListener('click', () => {
          document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
          document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
          btn.classList.add('active');
          const content = document.getElementById(cat);
          if (content) content.classList.add('active');
        });
        
        // Insertar el botón en el contenedor
        tabsContainer.appendChild(btn);
        
        // Crear el contenedor de contenido para la categoría, si aún no existe
        if (!document.getElementById(cat)) {
          const mainContent = document.querySelector('.magazine-content');
          const tabContent = document.createElement('div');
          tabContent.id = cat;
          tabContent.classList.add('tab-content');
          if (index === 0) tabContent.classList.add('active'); // Activo por defecto
          
          // Dentro del contenedor, se crea el grid para insertar los productos
          const grid = document.createElement('div');
          grid.id = 'grid-' + cat;
          grid.classList.add('product-grid');
          tabContent.appendChild(grid);
          
          // Insertar el contenedor dinámico en la sección principal
          mainContent.appendChild(tabContent);
        }
      });
    })
    .catch(error => console.error('Error loading categories:', error));





    
  // Función que actualiza elementos de la página con datos de config
  function applyConfig(config) {
      if(config.title) {
          document.title = config.title;
      }
      if(config.brand) {
          const logoEl = document.querySelector('.logo');
          if(logoEl) logoEl.textContent = config.brand;
      }
      if(config.tag) {
          const tagEl = document.querySelector('.tag');
          if(tagEl) tagEl.textContent = config.tag;
      }
      if(config.slogan) {
          const sloganEl = document.querySelector('.slogan');
          if(sloganEl) sloganEl.textContent = config.slogan;
      }
      if(config.vigencia) {
          const vigenciaEl = document.querySelector('.vigencia');
          if(vigenciaEl) vigenciaEl.textContent = `VIGENCIA: ${config.vigencia}`;
      }
      // Si hay colores definidos en config, se actualizan variables CSS (por ejemplo: primaryColor)
      if(config.primarycolor) {
          document.documentElement.style.setProperty('--primary-color', config.primarycolor);
      }

      // Footer: teléfono, mail, dirección, brand, disclaimers, etc.
      if (config.footerphone) {
          document.getElementById('footer-phone').textContent = config.footerphone;
      }
      if (config.footermail) {
          document.getElementById('footer-mail').textContent = config.footermail;
      }
      if (config.footeraddress) {
          document.getElementById('footer-address').textContent = config.footeraddress;
      }
      if (config.footerbrand) {
          document.getElementById('footer-brand').textContent = config.footerbrand;
      }
      if (config.footerdisclaimer) {
          document.getElementById('footer-disclaimer').textContent = config.footerdisclaimer;
      }
      if (config.footerslogan) {
          document.getElementById('footer-slogan').textContent = config.footerslogan;
      }

      // Enlace de YouTube
      if (config.footeryoutubelink) {
          const linkEl = document.getElementById('footer-youtube-link');
          linkEl.href = config.footeryoutubelink;
      }
      if (config.footeryoutubetext) {
          document.getElementById('footer-youtube-link').textContent = config.footeryoutubetext;
      }

  }

  /* ===============================
     2. Carga y Renderizado de Productos
  =============================== */
  fetch(productsUrlNoCache)
    .then(response => response.text())
    .then(text => {
      const jsonString = text.substring(text.indexOf('(') + 1, text.lastIndexOf(')'));
      const productData = JSON.parse(jsonString);
      const rows = productData.table.rows;
      // Se recorre cada fila y se crea un objeto producto
      rows.forEach(row => {
        // Se asume que las columnas tienen el siguiente orden:
        // 0: categoría, 1: featured ("si"/"no"), 2: imagen, 3: nombre, 4: descripción,
        // 5: información (ej. "1 kg • Stock: 10"), 6: precio original, 7: precio actual,
        // 8: límites de compra, 9: badge descuento, 10: badge bulk (opcional)
        const product = {
          category: row.c[0]?.v?.toLowerCase() || '',
          featured: (row.c[1]?.v || '').toLowerCase() === 'si',
          image: row.c[2]?.v || 'images/placeholder.png',
          name: row.c[3]?.v || '',
          description: row.c[4]?.v || '',
          info: row.c[5]?.v || '',
          originalPrice: row.c[6]?.v || '',
          currentPrice: row.c[7]?.v || '',
          purchaseLimits: row.c[8]?.v || '',
          discountBadge: row.c[9]?.v || '',
          bulkBadge: row.c[10]?.v || ''
        };
        renderProduct(product);
      });
    })
    .catch(error => {
      console.error('Error fetching products:', error);
    });

  // Inserta el producto en el contenedor correspondiente según su categoría y si es featured
  function renderProduct(product) {
    let containerId = '';
    // Si la categoría es "ofertas", se inserta en la sección de ofertas
    if(product.category === 'ofertas') {
      containerId = 'grid-ofertas';
    } else if(product.category === 'carnes') {
      containerId = product.featured ? 'featured-carnes' : 'grid-carnes';
    } else if(product.category === 'abarrotes') {
      containerId = product.featured ? 'featured-abarrotes' : 'grid-abarrotes';
    } else {
      // Para otras categorías, se espera que exista un contenedor con id "grid-[categoría]"
      containerId = 'grid-' + product.category;
    }
    const container = document.getElementById(containerId);
    if(container) {
      container.innerHTML += createProductCard(product);
    } else {
      console.warn(`No se encontró contenedor para la categoría: ${product.category}`);
    }
  }

  // Genera el HTML de la tarjeta de producto
  function createProductCard(product) {
    let badgeHtml = '';
    if(product.discountBadge) {
      badgeHtml = `<span class="discount-badge">${product.discountBadge}</span>`;
    } else if(product.bulkBadge) {
      badgeHtml = `<span class="bulk-badge">${product.bulkBadge}</span>`;
    }
    return `
      <div class="product-card">
        <div class="product-image">
          ${badgeHtml}
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-details">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <div class="product-info">
            <p>${product.info}</p>
          </div>
          <div class="product-price">
            ${product.originalPrice ? `<span class="original-price">$${product.originalPrice}</span>` : ''}
            ${product.currentPrice ? `<span class="current-price">$${product.currentPrice}</span>` : ''}
          </div>
          <div class="purchase-limits">
            <p>${product.purchaseLimits}</p>
          </div>
        </div>
      </div>
    `;
  }

  /* ===============================
     3. Funcionalidad de Navegación y Modal de Ayuda
  =============================== */
  // Cambio de pestañas
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
      button.addEventListener('click', function() {
          tabButtons.forEach(btn => btn.classList.remove('active'));
          tabContents.forEach(content => content.classList.remove('active'));
          this.classList.add('active');
          const tabId = this.getAttribute('data-tab');
          document.getElementById(tabId).classList.add('active');
      });
  });
  
  // Navegación de páginas (demo: cambia de pestaña aleatoriamente)
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  const currentPageEl = document.getElementById('current-page');
  const totalPagesEl = document.getElementById('total-pages');
  
  let currentPage = 1;
  let totalPages = parseInt(totalPagesEl.textContent) || 1;
  
  prevPageBtn.addEventListener('click', function() {
      if (currentPage > 1) {
          currentPage--;
          currentPageEl.textContent = currentPage;
          const randomTab = tabButtons[Math.floor(Math.random() * tabButtons.length)];
          randomTab.click();
      }
  });
  
  nextPageBtn.addEventListener('click', function() {
      if (currentPage < totalPages) {
          currentPage++;
          currentPageEl.textContent = currentPage;
          const randomTab = tabButtons[Math.floor(Math.random() * tabButtons.length)];
          randomTab.click();
      }
  });
  
  // Modal de ayuda
  const helpBtn = document.getElementById('help-btn');
  const helpModal = document.getElementById('help-modal');
  const closeBtn = document.querySelector('.close-button');
  const closeHelpBtn = document.querySelector('.close-help-button');
  
  helpBtn.addEventListener('click', function() {
      helpModal.style.display = 'block';
  });
  
  closeBtn.addEventListener('click', function() {
      helpModal.style.display = 'none';
  });
  
  closeHelpBtn.addEventListener('click', function() {
      helpModal.style.display = 'none';
  });
  
  window.addEventListener('click', function(event) {
      if (event.target === helpModal) {
          helpModal.style.display = 'none';
      }
  });
  
  // Navegación con el teclado
  document.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') {
          prevPageBtn.click();
      } else if (e.key === 'ArrowRight') {
          nextPageBtn.click();
      } else if (e.key === 'Escape' && helpModal.style.display === 'block') {
          helpModal.style.display = 'none';
      }
  });
  
  tabButtons.forEach(button => {
      button.setAttribute('tabindex', '0');
      button.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.click();
          }
      });
  });
});
