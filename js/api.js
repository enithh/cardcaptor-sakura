/**
 * ============================================================================
 * API.JS - Servicio de consumo y normalización de la API de Sakura Cards
 * ============================================================================
 */

const API_ENDPOINT = 'https://6388b6e5a4bb27a7f78f96a5.mockapi.io/sakura-cards/';

// Memoria global de cartas en el cliente
let cardsDataCache = [];
let isApiLoading = false;
let apiError = null;

/**
 * Consulta la API REST externa y almacena las cartas en memoria
 * @returns {Promise<Array>} Arreglo normalizado de cartas
 */
async function fetchCardsFromAPI() {
  isApiLoading = true;
  apiError = null;

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - No se pudo obtener la baraja de cartas.`);
    }

    const rawData = await response.json();

    if (!Array.isArray(rawData) || rawData.length === 0) {
      throw new Error('La respuesta de la API no contiene una lista de cartas válida.');
    }

    // Normalizar datos de las cartas
    cardsDataCache = rawData.map(card => {
      const num = parseInt(card.cardNumber, 10) || parseInt(card.id, 10) || 0;
      const formattedNumber = `N.º ${String(num).padStart(2, '0')}`;

      // Imagenes de respaldo en caso de cadenas vacías (ej. #53 El Amor y #55 La Esperanza no tienen versión Clow en el manga original)
      const sakuraImg = card.sakuraCard && card.sakuraCard.trim() !== '' 
        ? card.sakuraCard 
        : (card.clowCard || 'assets/images/sakura.png');
      
      const clowImg = card.clowCard && card.clowCard.trim() !== '' 
        ? card.clowCard 
        : (card.sakuraCard || 'assets/images/sakura.png');

      const romajiText = card.Rōmaji || card.romaji || '';

      return {
        id: String(card.id),
        cardNumber: num,
        formattedNumber: formattedNumber,
        spanishName: (card.spanishName || 'Carta Mágica').trim(),
        englishName: (card.englishName || '').trim(),
        kanji: (card.kanji || '').trim(),
        romaji: romajiText.trim(),
        meaning: (card.meaning || 'Una misteriosa carta mágica con poderes arcanos.').trim(),
        appeardAnime: card.appeardAnime ? String(card.appeardAnime).trim() : 'N/A',
        appeardManga: card.appeardManga ? String(card.appeardManga).trim() : 'N/A',
        sakuraCard: sakuraImg,
        clowCard: clowImg,
        hasClowVersion: Boolean(card.clowCard && card.clowCard.trim() !== ''),
        cardsReverse: card.cardsReverse || {
          clowReverse: 'https://i.ibb.co/LJSmQ4f/Reverso-Clow.jpg',
          sakuraReverse: 'https://i.ibb.co/XxrvMJ2/Reverso-Sakura.jpg'
        }
      };
    });

    // Ordenar ascendentemente por número de carta
    cardsDataCache.sort((a, b) => a.cardNumber - b.cardNumber);

    isApiLoading = false;
    return cardsDataCache;

  } catch (error) {
    console.error('Error al consultar la API de Sakura Cards:', error);
    isApiLoading = false;
    apiError = error.message || 'Error de conexión con la API externa';
    throw error;
  }
}

/**
 * Obtiene la lista de cartas almacenada en memoria
 * @returns {Array}
 */
function getCachedCards() {
  return cardsDataCache;
}

/**
 * Busca una carta específica por su ID
 * @param {string|number} id 
 * @returns {Object|undefined}
 */
function getCardById(id) {
  return cardsDataCache.find(c => String(c.id) === String(id));
}
