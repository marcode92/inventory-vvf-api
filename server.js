const path = require('path');
const express = require("express");
const cors = require("cors");
const pool = require('./db')
const app = express();
const MESSAGES = require('./constants/messages');
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
app.get('/modello', async (req, res) => {
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

app.get('/modello', async (req, res) => {
    id = req.query.id;
    try {
        const result = await pool.query(
            'SELECT * FROM modello WHERE id_modello = $1', [id]
        )
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
})
app.get('/nomemodello', async (req, res) => {
    nome_modello = req.query.nome_modello;
    try {
        const result = await pool.query(
            'SELECT nome_modello FROM modello WHERE nome_modello = $1', [nome_modello]
        )
        res.json(result.rows[0]?.nome_modello ?? null);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
})
app.put('/modello/:id', async (req, res) => {
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
                modello.caratteristiche,
                req.params.id
            ])
        return res.status(200).json({
            message: MESSAGES.ARTICLE_UPDATED
        })

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.post('/modello', async (req, res) => {
    const modelToCreate = req.body;

    const date = req.body.datapippo;
    try {

        const result = await pool.query(
            `INSERT INTO modello (
                    nome_modello,
                    id_categoria,
                    id_sottocategoria,
                    caratteristiche,
                    creation_date
                    )
                VALUES ($1, $2, $3, $4, CURRENT_DATE) RETURNING *`, [
            modelToCreate.nome_modello,
            modelToCreate.id_categoria,
            modelToCreate.id_sottocategoria,
            modelToCreate.caratteristiche,
        ])
        res.status(201).json({ message: MESSAGES.MODEL_CREATED, result: result.rows[0] });

    } catch (error) {
        if (error.code = "23505") {
            return res.status(409).json({
                message: MESSAGES.MODEL_EXISTING,
                error: error.detail
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
        if (checkqty.rows[0].disponibili == 0)
            return res.status(409).json({
                err: 'TUTTI',
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
        res.status(201).json({ message: MESSAGES.ARTICLE_CREATED, result: result.rows[0] });

    } catch (error) {
        if (error.code === '23505' && error.constraint === 'unique_seriale') {
            return res.status(409).json({
                message: MESSAGES.ARTICLE_SERIAL_EXISTING
            });
        }
        if (error.code === '23505' && error.constraint === 'articolo_pkey') {
            return res.status(409).json({
                message: MESSAGES.ARTICLE_NUMINV_EXISTING
            });
        }
        if (error.code === '23514' && error.constraint === 'stato_articolo_valido') {
            return res.status(400).json({
                message: MESSAGES.STATE_POSITION_NOT_VALID
            });
        }
        console.error(error);
        res.status(500).json({ error: error.message });
    }
})

/*CATEGORIA*/

app.get('/categoria', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM CATEGORIA`)

        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.get('/categoria/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query(`SELECT * FROM CATEGORIA WHERE ID=($1)`, [id])

        res.json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.get('/sottocategoria/:id/:idscat', async (req, res) => {
    const id = req.params.id;
    const idscat = req.params.idscat;

    try {
        const result = await pool.query(`SELECT * FROM SOTTOCATEGORIA WHERE ID_CATEGORIA=($1) AND ID=($2)`, [id, idscat])

        res.json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.get('/sottocategoria/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query(`SELECT * FROM SOTTOCATEGORIA WHERE ID_CATEGORIA = ($1)`, [id])

        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.post('/categoria', async (req, res) => {

    const categoria = req.body;

    try {
        const result = await pool.query(`INSERT INTO CATEGORIA (
                    nome_categoria)
                VALUES ($1)`, [categoria.nome_categoria])

        res.status(201).json({
            message: MESSAGES.CATEGORIA_CREATA, result: result.rows[0]
        })
    } catch (error) {
        if (error.constraint === 'categoria_nome_categoria_key') { res.status(409).json({ message: MESSAGES.CATEGORIA_NAME_EXISTING }); }
        if (error.constraint === 'categoria_nome_categoria_not_null') { res.status(409).json({ message: MESSAGES.CATEGORIA_NAME_EMPTY }); }
    }
})

/*SOTTOCATEGORIA*/
app.post('/sottocategoria', async (req, res) => {
    const sottocategoria = req.body;
    const id_categoria = req.params.id_categoria
    try {
        const result = await pool
            .query(`INSERT INTO SOTTOCATEGORIA (
                    nome_sottocategoria,
                    id_categoria,
                    CURRENT_DATE)
                VALUES ($1, $2) RETURNING *`, [sottocategoria.nome_sottocategoria, id_categoria])

        res.status(201).json({
            message: MESSAGES.SOTTOCATEGORIA_CREATED
        })
    } catch (error) {
        if (error.constraint === 'sottocategoria_nome_sottocategoria_key') { res.status(409).json({ message: MESSAGES.SOTTOCATEGORIA_NAME_EXISTING }); }
        if (error.constraint === 'sottocategoria_nome_sottocategoria_not_null') { res.status(409).json({ message: MESSAGES.SOTTOCATEGORIA_NAME_EMPTY }); }
    }
})

/*ARRIVI*/

app.get('/arrivi/modello', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT  m.*,
                c.nome_categoria,
                s.nome_sottocategoria
                    FROM modello m
                    INNER JOIN categoria c
                    ON m.id_categoria = c.id
                    LEFT JOIN sottocategoria s
                    ON m.id_sottocategoria = s.id
                    ORDER BY c.nome_categoria, m.nome_modello`)

                    res.json(result.rows)
                    res.status(201).json({ message: MESSAGES.GETLISTAMODELLIARRIVI, result: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
})
app.listen(3000, () => {
    console.log(MESSAGES.SERVER_STARTED)
})
