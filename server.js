const path = require('path');
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const pippo = require('./db')
const app = express();
const frontendPath = path.join(__dirname, '../frontend/dist/inventory/browser');

app.use(express.static(frontendPath));


pippo.query('SELECT NOW()')
    .then(result => console.log('connesso',result.rows))
    .catch(error => console.error('errore',error));

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

//const client = new MongoClient("mongodb://localhost:27017");

async function start(){
    await client.connect();
    console.log("qui connesso")
    const db = client.db("inventory_vvf");
    
    /************ASSETS SECTION*****************/
    const assets = db.collection("assets");

app.delete('/api/inventories/deleteasset', async (req, res) => {
  try {
    const matricola = req.query.matricola;
    console.log("stampa ", matricola)
    const result = await assets.deleteOne({matricola});

    return res.json(result);

  } catch (error) {
    return res.status(500).json({ error: 'Errore eliminazione' });
  }
});

    app.get("/api/inventories/assetshome", async (req,res) => {
        const risultati = await assets.find(
            {},
            { projection: {
                annotazioni:1,
                fuori_uso:1,
                last_update:1,
                matricola:1,
                possessori:1,
                stanza:1,
            }
        }).toArray();

        res.json(risultati);
    });
    
    app.get("/api/inventories/assetonefull", async (req,res) => {
        const matricola = req.query.matricola;
        const risultati = await assets.findOne({matricola});
        
        res.json(risultati);
    });
    
    app.post('/api/inventories/assets', async (req, res) => {
    const dati = req.body;
    const risultato = assets.insertOne(dati);
    
    res.json({
        salvato: true,
    });
});

app.put('/api/inventories/updateasset', async (req,res) =>{
    const matricola = req.query.matricola;
    const item = req.body
    const results = await assets.updateOne({matricola},{$set:item});
    res.json(results);
})
    /*****************************************/

    /************TYPE SECTION*****************/
    const modeltypes = db.collection("type");
    app.post('/api/inventories/type', async (req, res) => {

    let dati = req.body;

    const risultato = await modeltypes.insertOne(dati);
    
    res.json({
        salvato: true,
    });
    });

    app.get('/api/inventories/typelist', async (req,res) =>{
        const results = await modeltypes.find({}).toArray();

        res.json(results);
})

    app.get('/api/inventories/modelnames', async (req,res) =>{
        const results = await modeltypes.find({}, 
            { projection:{ nomeModello:1, _id:0 }}).toArray();

        res.json(results.map(nome => nome.nomeModello));
})

    app.get('/api/inventories/type', async (req,res) =>{
        const name = req.query.modelname;
        const results = await modeltypes.findOne({nomeModello: name});

        res.json(results);
})

/****************START FRONTEND */
app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});
/*********************************/
    app.listen(3000, () => {
        console.log("api 3000")
    })
}

start();