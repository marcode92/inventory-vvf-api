const path = require('path');
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const pool = require('./db')
const app = express();
const frontendPath = path.join(__dirname, '../frontend/dist/inventory/browser');

app.use(express.static(frontendPath));


pool.query('SELECT NOW()')
    .then(result => console.log('connesso', result.rows))
    .catch(error => console.error('errore', error));

/* 

app.options('/api/inventories/type', (req, res) => {

    console.log('SONO DENTRO OPTIONS');

    res.setHeader(
        'Access-Control-Allow-Origin',
        'http://localhost:4200'
    );

    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
    );

    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type'
    );

    res.sendStatus(204);
}); */

app.use(cors({
    origin: "http://localhost:4200"
}));
app.use(express.json())
/****MODELLO******/
app.get('/creamodelli', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM modello'
        )
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
})

app.put('/modelli/:id', async (req, res) => {
    id = req.params.id;
    const modello = req.body
    try {
        const result = await pool.query(
            'SELECT * FROM ARTICOLO WHERE id_modello = $1', [id])
        if (result.rowCount > 0)
            return res.status(409).json({
                message: "articoli inventariati, modifica non consentita"
            })

        await pool.query(
            `UPDATE modello 
            SET
             nome_modello = $1,
             categoria = $2,
             sottocategoria = $3,
             quantita = $4,
             caratteristiche = $5
            WHERE id_modello = $6
                 RETURNING *`,
            [
                modello.nome_modello,
                modello.categoria,
                modello.sottocategoria,
                modello.quantita,
                JSON.stringify(modello.caratteristiche),
                req.params.id
            ])
        return res.status(200).json({
            message: "articolo aggiornato"
        })

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.post('/modelli', async (req, res) => {
    const modelToCreate = req.body;

    const date = req.body.datapippo;
    try {

        const result = await pool.query(
            `INSERT INTO modello (
                    nome_modello,
                    categoria,
                    sottocategoria,
                    quantita,
                    stato,
                    caratteristiche,
                    creation_date
                    )
                VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE) RETURNING *`, [
            modelToCreate.nome_modello,
            modelToCreate.categoria,
            modelToCreate.sottocategoria,
            modelToCreate.quantita,
            modelToCreate.stato,
            JSON.stringify(modelToCreate.caratteristiche)
        ])
        res.status(201).json({ message: 'creato', result: result.rows[0] });

    } catch (error) {
        if (error.code = "23505") {
            return res.status(409).json({
                message: "Modello già esistente"
            })
        }
        console.error(error);
        res.status(500).json({ error: error.message });
    }
})

/******ARTICOLO****************/
app.post('/articolo', async (req, res) => {
    const articleToAdd = req.body;

    try {
        const checkqty = await pool.query(
            `SELECT
                m.quantita - COUNT(a.num_inventario) AS disponibili
                 FROM modello m
                 LEFT JOIN articolo a ON m.id_modello = a.id_modello
                 WHERE m.id_modello = $1
                 GROUP BY m.id_modello, m.quantita`, [articleToAdd.id_modello])
         if(checkqty.rows[0].disponibili == 0)
         return res.status(409).json({
                err:'TUTTI',
                message: 'ARTICOLI TUTTI INVENTARIATI'
            });    

        const result = await pool.query(
            `INSERT INTO articolo (
                    num_inventario,
                    id_modello,
                    seriale,
                    stato,
                    posizione,
                    last_move,
                    data_inventario
                    )
                VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE) RETURNING *`, [
            articleToAdd.num_inventario,
            articleToAdd.id_modello,
            articleToAdd.seriale,
            articleToAdd.stato,
            articleToAdd.posizione,
            articleToAdd.last_move,
        ])
        res.status(201).json({ message: 'creato', result: result.rows[0] });

    } catch (error) {
        if (error.code === '23505' && error.constraint === 'unique_seriale') {
            return res.status(409).json({
                message: 'Esiste già un articolo con questo numero seriale'
            });
        }
        if (error.code === '23505' && error.constraint === 'articolo_pkey') {
            return res.status(409).json({
                message: 'Esiste già un articolo con questo numero inventario'
            });
        }
        if (error.code === '23514' && error.constraint === 'stato_articolo_valido') {
            return res.status(400).json({
                message: 'Stato e posizione dell’articolo non coerenti'
            });
        }
        console.error(error);
        res.status(500).json({ error: error.message });
    }
})

app.listen(3000, () => {
    console.log('server avviato sulla porta 3000')
})
