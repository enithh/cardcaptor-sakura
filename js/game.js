/**
 * ============================================================================
 * GAME.JS - Minijuego Oráculo "¿Qué carta Clow eres?" (Diseño Horizontal)
 * ============================================================================
 */

// Referencias DOM del juego
let divinationCard;
let divinationCardImg;
let gameIntroBox;
let gameCastingBox;
let gameDetailsBox;
let gameActionBtn;
let gameActionBtnText;
let gameCardHint;
let magicRune;

// Elementos de información del resultado
let resultSpanishName;
let resultCardNumber;
let resultEnglishName;
let resultKanjiRomaji;
let resultMeaning;
let resultAnime;
let resultManga;

let isGameBusy = false;

/**
 * Inicializa los elementos y eventos de la sección Juego
 */
function initGameModule() {
  divinationCard = document.getElementById('divinationCard');
  divinationCardImg = document.getElementById('divinationCardImg');
  gameIntroBox = document.getElementById('gameIntroBox');
  gameCastingBox = document.getElementById('gameCastingBox');
  gameDetailsBox = document.getElementById('gameDetailsBox');
  gameActionBtn = document.getElementById('gameActionBtn');
  gameActionBtnText = document.getElementById('gameActionBtnText');
  gameCardHint = document.getElementById('gameCardHint');
  magicRune = document.getElementById('magicRune');

  resultSpanishName = document.getElementById('resultSpanishName');
  resultCardNumber = document.getElementById('resultCardNumber');
  resultEnglishName = document.getElementById('resultEnglishName');
  resultKanjiRomaji = document.getElementById('resultKanjiRomaji');
  resultMeaning = document.getElementById('resultMeaning');
  resultAnime = document.getElementById('resultAnime');
  resultManga = document.getElementById('resultManga');

  if (gameActionBtn) {
    gameActionBtn.addEventListener('click', handleGameAction);
  }
}

/**
 * Maneja el clic en el botón del juego según el estado actual:
 * - Si hay una carta revelada -> Ejecuta el RESET al estado inicial y espera.
 * - Si está en estado inicial -> Ejecuta la adivinación y revela la carta.
 */
async function handleGameAction() {
  if (isGameBusy) return;

  const isRevealed = divinationCard && divinationCard.classList.contains('revealed');

  if (isRevealed) {
    await resetGameToInitialState();
  } else {
    await performDivination();
  }
}

/**
 * Reinicia visualmente el oráculo a su estado original (Reverso en reposo + botón ADIVINAR)
 */
async function resetGameToInitialState() {
  isGameBusy = true;

  // Deshabilitar botón durante la animación de reinicio
  if (gameActionBtn) {
    gameActionBtn.style.pointerEvents = 'none';
    gameActionBtn.style.opacity = '0.7';
  }

  // 1. Ocultar detalles del resultado anterior y mostrar cuadro inicial
  if (gameDetailsBox) gameDetailsBox.style.display = 'none';
  if (gameCastingBox) gameCastingBox.style.display = 'none';
  if (gameIntroBox) gameIntroBox.style.display = 'flex';

  // 2. Restaurar texto indicativo al reverso original
  if (gameCardHint) {
    gameCardHint.innerHTML = '<span>✦ Reverso de la Clow Card ✦</span>';
  }

  // 3. Quitar estados de revelado y casteo: la carta gira suavemente al reverso original (0deg)
  if (divinationCard) {
    divinationCard.classList.remove('revealed');
    divinationCard.classList.remove('casting');
  }

  // 4. Restaurar velocidad y estilo normal de la runa mágica
  if (magicRune) {
    magicRune.style.animationDuration = '45s';
    magicRune.style.borderColor = 'rgba(255, 212, 59, 0.25)';
  }

  // 5. Cambiar texto del botón a "ADIVINAR"
  if (gameActionBtnText) {
    gameActionBtnText.textContent = 'ADIVINAR';
  }

  // 6. Pausa para permitir que la animación de giro 3D de regreso se complete (800ms)
  await new Promise(resolve => setTimeout(resolve, 800));

  // 7. Rehabilitar botón y quedar en espera del próximo clic del usuario en "ADIVINAR"
  if (gameActionBtn) {
    gameActionBtn.style.pointerEvents = 'auto';
    gameActionBtn.style.opacity = '1';
  }

  isGameBusy = false;
}

/**
 * Ejecuta el proceso de casteo mágico y revelación de una nueva carta Clow aleatoria
 */
async function performDivination() {
  const cards = getCachedCards();
  if (!cards || cards.length === 0) {
    alert('Espera a que las cartas mágicas terminen de cargarse de la API.');
    return;
  }

  isGameBusy = true;

  // Deshabilitar botón temporalmente durante el casteo y revelación
  if (gameActionBtn) {
    gameActionBtn.style.pointerEvents = 'none';
    gameActionBtn.style.opacity = '0.7';
  }

  // Ocultar cuadro introductorio y detalles previos; mostrar animación de casteo
  if (gameIntroBox) gameIntroBox.style.display = 'none';
  if (gameDetailsBox) gameDetailsBox.style.display = 'none';
  if (gameCastingBox) gameCastingBox.style.display = 'flex';

  // Acelerar animación del círculo mágico rúnico
  if (magicRune) {
    magicRune.style.animationDuration = '3s';
    magicRune.style.borderColor = 'rgba(255, 212, 59, 0.9)';
  }

  // Iniciar animación de casteo en la carta
  if (divinationCard) {
    divinationCard.classList.remove('revealed');
    divinationCard.classList.add('casting');
  }

  // Duración del casteo mágico (1.2s)
  await new Promise(resolve => setTimeout(resolve, 1200));

  // Seleccionar carta aleatoria del array obtenido de la API
  const randomIndex = Math.floor(Math.random() * cards.length);
  const selectedCard = cards[randomIndex];

  // Configurar una nueva imagen para la Clow Card seleccionada
const targetImg = selectedCard.clowCard || selectedCard.sakuraCard;

if (divinationCardImg && targetImg) {
  const newImg = document.createElement('img');

  newImg.id = 'divinationCardImg';
  newImg.className = 'divination-img';
  newImg.alt = `Clow Card ${selectedCard.spanishName}`;

  // Agregamos un parámetro único para evitar que el navegador
  // conserve visualmente la imagen anterior.
  const separator = targetImg.includes('?') ? '&' : '?';
  const freshImageUrl = `${targetImg}${separator}gameCard=${Date.now()}`;

  newImg.src = freshImageUrl;

  // Reemplazar completamente el elemento anterior
  divinationCardImg.replaceWith(newImg);

  // Actualizar la referencia global al nuevo elemento
  divinationCardImg = newImg;

  // Esperar a que la imagen nueva esté cargada
  await new Promise((resolve) => {
    if (newImg.complete) {
      resolve();
      return;
    }

    newImg.onload = resolve;
    newImg.onerror = resolve;
  });
}

  // Poblar información del resultado
  if (resultSpanishName) resultSpanishName.textContent = selectedCard.spanishName;
  if (resultCardNumber) resultCardNumber.textContent = selectedCard.formattedNumber;
  if (resultEnglishName) resultEnglishName.textContent = selectedCard.englishName || '—';
  
  const kanjiRomaji = [selectedCard.kanji, selectedCard.romaji].filter(Boolean).join(' · ');
  if (resultKanjiRomaji) resultKanjiRomaji.textContent = kanjiRomaji || '—';
  if (resultMeaning) resultMeaning.textContent = `« ${selectedCard.meaning} »`;

  if (resultAnime) {
    resultAnime.textContent = selectedCard.appeardAnime !== 'N/A' 
      ? `📺 Anime: Ep. ${selectedCard.appeardAnime}` 
      : '📺 Anime: No listado';
  }

  if (resultManga) {
    resultManga.textContent = selectedCard.appeardManga !== 'N/A' 
      ? `📖 Manga: Tomo ${selectedCard.appeardManga}` 
      : '📖 Manga: No listado';
  }

  if (gameCardHint) {
    gameCardHint.innerHTML = `<span>✦ Clow Card: ${selectedCard.spanishName} ✦</span>`;
  }

  // Detener animación de casteo y revelar la carta frontal en 3D
  if (divinationCard) {
    divinationCard.classList.remove('casting');
    divinationCard.classList.add('revealed');
  }

  // Restaurar velocidad lenta del círculo mágico
  if (magicRune) {
    magicRune.style.animationDuration = '45s';
    magicRune.style.borderColor = 'rgba(255, 212, 59, 0.25)';
  }

  // Mostrar cuadro de detalles del resultado
  if (gameCastingBox) gameCastingBox.style.display = 'none';
  if (gameDetailsBox) gameDetailsBox.style.display = 'flex';

  // Cambiar texto del botón a "VOLVER A BARAJAR LAS CARTAS"
  if (gameActionBtnText) {
    gameActionBtnText.textContent = 'VOLVER A BARAJAR LAS CARTAS';
  }

  // Rehabilitar botón al finalizar completamente la revelación
  if (gameActionBtn) {
    gameActionBtn.style.pointerEvents = 'auto';
    gameActionBtn.style.opacity = '1';
  }

  isGameBusy = false;
}
