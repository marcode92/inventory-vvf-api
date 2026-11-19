const MESSAGES = Object.freeze({
    ARTICLE_CREATED: 'Articolo creato',
    ARTICLE_UPDATED: 'Articolo aggiornato',
    MODEL_EXISTING: 'Modello già esistente',
    MODEL_CREATED: 'Modello creato',
    ARTICLE_SERIAL_EXISTING: 'Esiste già un articolo con questo numero seriale',
    ARTICLE_NUMINV_EXISTING:'Esiste già un articolo con questo numero inventario',
    STATE_POSITION_NOT_VALID:'Stato e posizione dell’articolo non coerenti',
    SERVER_STARTED: 'Server avviato sulla porta 3000',
    SOTTOCATEGORIA_CREATED: 'Sottocategoria creata',

    CATEGORIA_CREATED: 'Categoria creata',
    CATEGORIA_NAME_EXISTING: 'Nome categoria già esistente',
    CATEGORIA_NAME_EMPTY: 'Nome categoria obbligatorio',

    SOTTOCATEGORIA_NAME_NOT_NULL: 'Inserisci il nome della sottocategoria',
    UNIQUE_SOTTOCATEGORIA_NAME: 'Questa sottocategoria esiste già nella categoria scelta'
})

module.exports = MESSAGES;