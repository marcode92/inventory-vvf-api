const express = require("express");

const cors = require("cors");

const {MongoClient} = require("mongodb")

const app = express();
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

const client = new MongoClient("mongodb://localhost:27017");

async function start(){
    await client.connect();
    console.log("qui connesso")
    const db = client.db("inventory_vvf");
    
    /************ASSETS SECTION*****************/
    const assets = db.collection("assets");

    app.get("inventories/assets", async (req,res) => {
        const risultati = await assets.find({}).toArray();

        res.json(risultati);
    });

    app.post('/api/inventories/assets', async (req, res) => {
    const dati = req.body;
    const risultato = assets.insertOne(dati);
    
    res.json({
        salvato: true,
        id: risultato.insertedId
    });
    });
    
    /*****************************************/

    /************TYPE SECTION*****************/
    const modeltypes = db.collection("type");
    app.post('/api/inventories/type', async (req, res) => {

    const dati = req.body;

    const risultato = modeltypes.insertOne(dati);
    
    res.json({
        salvato: true,
        id: risultato.insertedId
    });
    });

    app.get('/api/inventories/typelist', async (req,res) =>{
        const results = await modeltypes.find({}).toArray();

        res.json(results);
})

    app.get('/api/inventories/modelnames', async (req,res) =>{
        const results = await modeltypes.find({}, 
            { projection:{ nome_modello:1, _id:0 }}).toArray();

        res.json(results.map(nome => nome.nome_modello));
})

    app.get('/api/inventories/type', async (req,res) =>{
        const name = req.query.modelname;
        const results = await modeltypes.findOne({nome_modello: name});

        res.json(results);
})

    app.listen(3000, () => {
        console.log("api 3000")
    })
}

start();