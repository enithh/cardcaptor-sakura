/**
 * ============================================================================
 * COLLECTION.JS - Controlador del Catálogo, Filtros, Búsqueda, Flip 3D y Modal
 * ============================================================================
 */

// Estado del módulo de colección
const collectionState = {
  currentFilter: 'all', // 'all' | 'sakura' | 'clow'
  searchQuery: '',
  isClowVersion: false, // false: Sakura default, true: Clow
  isDeckExpanded: false, // false: muestra 10 cartas, true: muestra toda la baraja
  activeModalCardId: null,
  modalSelectedVersion: 'sakura' // 'sakura' | 'clow'
};

const INITIAL_CARDS_LIMIT = 10;

// Referencias DOM
let cardsGridContainer;
let cardSearchInput;
let clearSearchBtn;
let filterChipButtons;
let cardVersionSwitch;
let sakuraLabel;
let clowLabel;
let deckToggleWrapper;
let toggleDeckBtn;
let toggleDeckBtnText;

// Modal DOM
let cardDetailModal;
let closeModalBtn;
let modalCardImg;
let modalTabSakura;
let modalTabClow;
let modalSpanishName;
let modalCardNumber;
let modalEnglishName;
let modalKanjiRomaji;
let modalMeaning;
let modalAnimeApp;
let modalMangaApp;
let modalPrevCardBtn;
let modalNextCardBtn;

/**
 * Inicializa los elementos y eventos de la sección Colección
 */
function initCollectionModule() {
  // Obtener elementos del DOM
  cardsGridContainer = document.getElementById('cardsGridContainer');
  cardSearchInput = document.getElementById('cardSearchInput');
  clearSearchBtn = document.getElementById('clearSearchBtn');
  filterChipButtons = document.querySelectorAll('.filter-chip');
  cardVersionSwitch = document.getElementById('cardVersionSwitch');
  sakuraLabel = document.getElementById('sakuraLabel');
  clowLabel = document.getElementById('clowLabel');
  deckToggleWrapper = document.getElementById('deckToggleWrapper');
  toggleDeckBtn = document.getElementById('toggleDeckBtn');
  toggleDeckBtnText = document.getElementById('toggleDeckBtnText');

  // Modal
  cardDetailModal = document.getElementById('cardDetailModal');
  closeModalBtn = document.getElementById('closeModalBtn');
  modalCardImg = document.getElementById('modalCardImg');
  modalTabSakura = document.getElementById('modalTabSakura');
  modalTabClow = document.getElementById('modalTabClow');
  modalSpanishName = document.getElementById('modalSpanishName');
  modalCardNumber = document.getElementById('modalCardNumber');
  modalEnglishName = document.getElementById('modalEnglishName');
  modalKanjiRomaji = document.getElementById('modalKanjiRomaji');
  modalMeaning = document.getElementById('modalMeaning');
  modalAnimeApp = document.getElementById('modalAnimeApp');
  modalMangaApp = document.getElementById('modalMangaApp');
  modalPrevCardBtn = document.getElementById('modalPrevCardBtn');
  modalNextCardBtn = document.getElementById('modalNextCardBtn');

  // Registrar Event Listeners
  setupEventListeners();

  // Cargar datos y renderizar
  loadAndRenderCollection();
}

/**
 * Registra los listeners de eventos para búsqueda, filtros, switches, toggle deck y modal
 */
function setupEventListeners() {
  // Búsqueda en tiempo real
  if (cardSearchInput) {
    cardSearchInput.addEventListener('input', (e) => {
      collectionState.searchQuery = e.target.value.trim().toLowerCase();
      if (clearSearchBtn) {
        clearSearchBtn.style.display = collectionState.searchQuery ? 'flex' : 'none';
      }
      filterAndRenderCards();
    });
  }

  // Botón limpiar búsqueda
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (cardSearchInput) {
        cardSearchInput.value = '';
        collectionState.searchQuery = '';
        clearSearchBtn.style.display = 'none';
        cardSearchInput.focus();
        filterAndRenderCards();
      }
    });
  }

  // Filtros de categoría [ Todas | Sakura | Clow ]
  filterChipButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const targetBtn = e.currentTarget || button;
      const selectedFilter = targetBtn.getAttribute('data-filter') || targetBtn.dataset.filter || 'all';

      // 1. Gestionar clases visuales activas en los tres botones
      filterChipButtons.forEach(btn => btn.classList.remove('active'));
      targetBtn.classList.add('active');

      // 2. Actualizar el filtro activo
      collectionState.currentFilter = selectedFilter;

      // 3. Sincronización automática de versión visual e interfaz del switch:
      if (selectedFilter === 'sakura') {
        collectionState.isClowVersion = false;
        updateVersionSwitchUI();
      } else if (selectedFilter === 'clow') {
        collectionState.isClowVersion = true;
        updateVersionSwitchUI();
      }
      // Si selectedFilter === 'all', se conserva la versión actualmente activa sin modificar isClowVersion ni el switch

      // 4. Renderizar las cartas aplicando el filtro y la versión de imágenes correspondiente
      filterAndRenderCards();
    });
  });

  // Switch Toggle Sakura / Clow (Manual)
  if (cardVersionSwitch) {
    cardVersionSwitch.addEventListener('change', (e) => {
      collectionState.isClowVersion = e.target.checked;
      updateVersionSwitchUI();
      filterAndRenderCards();
    });
  }

  // Botón Mostrar Baraja Completa / Ocultar Baraja
  if (toggleDeckBtn) {
    toggleDeckBtn.addEventListener('click', () => {
      collectionState.isDeckExpanded = !collectionState.isDeckExpanded;
      filterAndRenderCards();

      // Si se contrajo la baraja, hacer scroll suave al inicio de la colección para comodidad
      if (!collectionState.isDeckExpanded) {
        const coleccionEl = document.getElementById('coleccion');
        if (coleccionEl) {
          coleccionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }

  // Modal Close Events
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeCardModal);
  }

  if (cardDetailModal) {
    cardDetailModal.addEventListener('click', (e) => {
      if (e.target === cardDetailModal) {
        closeCardModal();
      }
    });
  }

  // Escape key closes modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cardDetailModal && cardDetailModal.classList.contains('active')) {
      closeCardModal();
    }
  });

  // Modal Tabs (Sakura / Clow)
  if (modalTabSakura && modalTabClow) {
    modalTabSakura.addEventListener('click', () => switchModalVersion('sakura'));
    modalTabClow.addEventListener('click', () => switchModalVersion('clow'));
  }

  // Modal Nav Prev / Next
  if (modalPrevCardBtn) {
    modalPrevCardBtn.addEventListener('click', () => navigateModalCard(-1));
  }
  if (modalNextCardBtn) {
    modalNextCardBtn.addEventListener('click', () => navigateModalCard(1));
  }
}

/**
 * Sincroniza visualmente el estado del switch y sus etiquetas (Sakura / Clow)
 */
function updateVersionSwitchUI() {
  if (cardVersionSwitch) {
    cardVersionSwitch.checked = collectionState.isClowVersion;
  }
  if (sakuraLabel && clowLabel) {
    if (collectionState.isClowVersion) {
      sakuraLabel.classList.remove('active');
      clowLabel.classList.add('active');
    } else {
      clowLabel.classList.remove('active');
      sakuraLabel.classList.add('active');
    }
  }
}

/**
 * Carga inicial de datos de la API y renderizado
 */
async function loadAndRenderCollection() {
  renderLoadingState();

  try {
    const cards = await fetchCardsFromAPI();
    filterAndRenderCards();
  } catch (error) {
    renderErrorState(error.message);
  }
}

/**
 * Filtra las cartas según la búsqueda y el chip de filtro, y aplica el límite inicial de 10
 */
function filterAndRenderCards() {
  const allCards = getCachedCards();
  if (!allCards || allCards.length === 0) return;

  const query = collectionState.searchQuery;
  const filter = collectionState.currentFilter;

  // Filtrar entre TODAS las cartas de la API
  const filtered = allCards.filter(card => {
    // Filtro por tipo (Sakura / Clow / All)
    if (filter === 'clow' && !card.hasClowVersion) {
      return false;
    }

    // Filtro por texto de búsqueda
    if (query) {
      const matchSpanish = card.spanishName.toLowerCase().includes(query);
      const matchEnglish = card.englishName.toLowerCase().includes(query);
      const matchKanji = card.kanji.toLowerCase().includes(query);
      const matchRomaji = card.romaji.toLowerCase().includes(query);
      const matchMeaning = card.meaning.toLowerCase().includes(query);
      const matchNum = String(card.cardNumber).includes(query);

      return matchSpanish || matchEnglish || matchKanji || matchRomaji || matchMeaning || matchNum;
    }

    return true;
  });

  // Determinar cuántas cartas mostrar (10 si está colapsado, todas si está expandido)
  const isExpanded = collectionState.isDeckExpanded;
  const cardsToDisplay = isExpanded ? filtered : filtered.slice(0, INITIAL_CARDS_LIMIT);

  // Actualizar botón Mostrar baraja completa / Ocultar baraja
  updateDeckToggleButton(filtered.length);

  // Renderizar o mostrar estado vacío
  if (filtered.length === 0) {
    renderEmptyState();
  } else {
    renderCardsGrid(cardsToDisplay);
  }
}

/**
 * Actualiza la visibilidad y texto del botón de expandir/contraer baraja
 */
function updateDeckToggleButton(filteredTotal) {
  if (!deckToggleWrapper || !toggleDeckBtnText) return;

  if (filteredTotal <= INITIAL_CARDS_LIMIT) {
    deckToggleWrapper.style.display = 'none';
  } else {
    deckToggleWrapper.style.display = 'flex';
    if (collectionState.isDeckExpanded) {
      toggleDeckBtnText.textContent = '✦ OCULTAR BARAJA ✦';
    } else {
      toggleDeckBtnText.textContent = '✦ MOSTRAR BARAJA COMPLETA ✦';
    }
  }
}

/**
 * Renderiza la cuadrícula de cartas
 * @param {Array} cards 
 */
function renderCardsGrid(cards) {
  if (!cardsGridContainer) return;

  cardsGridContainer.innerHTML = `
    <div class="cards-grid" id="cardsGrid">
      ${cards.map(card => createCardHTML(card)).join('')}
    </div>
  `;

  // Añadir eventos de click para abrir modal
  const cardElements = cardsGridContainer.querySelectorAll('.card-item');
  cardElements.forEach(el => {
    el.addEventListener('click', (e) => {
      const cardId = el.dataset.cardId;
      openCardModal(cardId);
    });
  });
}

/**
 * Genera el HTML de una tarjeta individual con soporte 3D Flip mostrando el REVERSO en hover
 * @param {Object} card 
 * @returns {string} HTML string
 */
function createCardHTML(card) {
  const kanjiRomaji = [card.kanji, card.romaji].filter(Boolean).join(' · ');
  const isClow = collectionState.isClowVersion;

  // Cara frontal: Sakura Card o Clow Card según el switch
  const frontImg = isClow ? card.clowCard : card.sakuraCard;
  const frontTag = isClow ? '🌙 CLOW' : '🌸 SAKURA';

  // Cara trasera: Reverso oficial de la baraja activa
  const reverseImg = isClow 
    ? (card.cardsReverse?.clowReverse || 'https://i.ibb.co/LJSmQ4f/Reverso-Clow.jpg')
    : (card.cardsReverse?.sakuraReverse || 'https://i.ibb.co/XxrvMJ2/Reverso-Sakura.jpg');

  return `
    <article class="card-item pixel-box" data-card-id="${card.id}" tabindex="0" role="button" aria-label="Carta ${card.spanishName}, número ${card.cardNumber}">
      <!-- 3D Flip Stage -->
      <div class="card-flip-stage">
        <div class="card-flip-inner">
          <!-- Cara Frontal (Carta Mágica activa) -->
          <div class="card-face card-face-front">
            <img src="${frontImg}" alt="${frontTag} ${card.spanishName}" loading="lazy" onerror="this.src='https://i.ibb.co/XxrvMJ2/Reverso-Sakura.jpg'">
            <span class="version-chip-tag">${frontTag}</span>
          </div>

          <!-- Cara Trasera (Reverso oficial al pasar el mouse) -->
          <div class="card-face card-face-back">
            <img src="${reverseImg}" alt="Reverso ${frontTag}" loading="lazy" onerror="this.src='https://i.ibb.co/LJSmQ4f/Reverso-Clow.jpg'">
            <span class="reverse-chip-tag">✦ REVERSO</span>
          </div>
        </div>
      </div>

      <!-- Card Information -->
      <div class="card-info-content">
        <div class="card-header-row">
          <h3 class="card-spanish-name">${card.spanishName}</h3>
          <span class="card-number-badge">${card.formattedNumber}</span>
        </div>

        <div class="card-subnames-row">
          <span class="card-english-name">${card.englishName}</span>
          ${kanjiRomaji ? `<span class="card-divider">·</span><span class="card-kanji-romaji">${kanjiRomaji}</span>` : ''}
        </div>

        <p class="card-meaning-snippet" title="${card.meaning}">
          « ${card.meaning} »
        </p>

        <div class="card-action-footer">
          <span class="btn-detail-link">✦ Ver detalles ➔</span>
        </div>
      </div>
    </article>
  `;
}

/**
 * Abre el modal con el detalle completo de la carta seleccionada
 * @param {string} cardId 
 */
function openCardModal(cardId) {
  const card = getCardById(cardId);
  if (!card) return;

  collectionState.activeModalCardId = card.id;
  collectionState.modalSelectedVersion = collectionState.isClowVersion ? 'clow' : 'sakura';

  // Llenar campos del modal
  modalSpanishName.textContent = card.spanishName;
  modalCardNumber.textContent = card.formattedNumber;
  modalEnglishName.textContent = card.englishName || '—';
  
  const kanjiRomaji = [card.kanji, card.romaji].filter(Boolean).join(' · ');
  modalKanjiRomaji.textContent = kanjiRomaji || '—';
  modalMeaning.textContent = card.meaning;
  modalAnimeApp.textContent = card.appeardAnime !== 'N/A' ? `Episodio ${card.appeardAnime}` : 'No listado';
  modalMangaApp.textContent = card.appeardManga !== 'N/A' ? `Capítulo/Tomo ${card.appeardManga}` : 'No listado';

  // Configurar pestaña e imagen inicial
  switchModalVersion(collectionState.modalSelectedVersion);

  // Mostrar modal
  cardDetailModal.classList.add('active');
  cardDetailModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

/**
 * Cambia la versión visual en el modal (Sakura / Clow)
 * @param {'sakura'|'clow'} version 
 */
function switchModalVersion(version) {
  const card = getCardById(collectionState.activeModalCardId);
  if (!card) return;

  collectionState.modalSelectedVersion = version;

  if (version === 'clow') {
    modalTabSakura.classList.remove('active');
    modalTabClow.classList.add('active');
    modalCardImg.src = card.clowCard;
    modalCardImg.alt = `Clow Card ${card.spanishName}`;
  } else {
    modalTabClow.classList.remove('active');
    modalTabSakura.classList.add('active');
    modalCardImg.src = card.sakuraCard;
    modalCardImg.alt = `Sakura Card ${card.spanishName}`;
  }
}

/**
 * Cierra el modal de detalle
 */
function closeCardModal() {
  if (!cardDetailModal) return;
  cardDetailModal.classList.remove('active');
  cardDetailModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/**
 * Navega a la carta anterior o siguiente en el modal
 * @param {number} direction -1 o 1
 */
function navigateModalCard(direction) {
  const allCards = getCachedCards();
  if (!allCards || allCards.length === 0) return;

  const currentIndex = allCards.findIndex(c => String(c.id) === String(collectionState.activeModalCardId));
  if (currentIndex === -1) return;

  let newIndex = currentIndex + direction;
  if (newIndex < 0) newIndex = allCards.length - 1;
  if (newIndex >= allCards.length) newIndex = 0;

  openCardModal(allCards[newIndex].id);
}

/**
 * Renderiza el estado de carga
 */
function renderLoadingState() {
  if (!cardsGridContainer) return;
  if (deckToggleWrapper) deckToggleWrapper.style.display = 'none';
  cardsGridContainer.innerHTML = `
    <div class="state-box loading-state">
      <div class="state-icon">🌸</div>
      <h3 class="state-title">Invocando cartas mágicas...</h3>
      <p class="state-desc">Conectando con el Libro de Clow para obtener los sellos arcanos.</p>
    </div>
  `;
}

/**
 * Renderiza el estado de error con botón de reintento
 * @param {string} message 
 */
function renderErrorState(message) {
  if (!cardsGridContainer) return;
  if (deckToggleWrapper) deckToggleWrapper.style.display = 'none';
  cardsGridContainer.innerHTML = `
    <div class="state-box error-state">
      <div class="state-icon">⚠️</div>
      <h3 class="state-title">Error al cargar la colección</h3>
      <p class="state-desc">${message || 'No se pudo establecer conexión con la API externa.'}</p>
      <button class="pixel-btn" onclick="loadAndRenderCollection()">
        <span>🔄</span> Reintentar invocación
      </button>
    </div>
  `;
}

/**
 * Renderiza el estado sin resultados
 */
function renderEmptyState() {
  if (!cardsGridContainer) return;
  if (deckToggleWrapper) deckToggleWrapper.style.display = 'none';
  cardsGridContainer.innerHTML = `
    <div class="state-box empty-state">
      <div class="state-icon">✨</div>
      <h3 class="state-title">No se encontraron cartas mágicas</h3>
      <p class="state-desc">Ninguna carta coincide con tu búsqueda «${collectionState.searchQuery}». Intenta buscar por otro nombre, kanji o significado.</p>
    </div>
  `;
}
