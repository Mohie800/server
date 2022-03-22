const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const knex = require('knex');

// const knex = require('./knex/knex.js');
// const { Client } = require('pg');

// const client = new Client({
//     connectionString: process.env.DATABASE_URL,
//     ssl: {
//       rejectUnauthorized: false
//     }
//   });


var salt = bcrypt.genSaltSync();

const pgr = knex(
    {
    client: 'pg',
    connection: {
      connectionsrting : process.env.DATABASE_URL,
      ssl: true
    }
  });


//   console.log (pgr.select("*").from("users"))

const app = express();
app.use(bodyParser.json());
app.use(cors());



app.get("/", (req, rep) => {
    rep.json("goood")
})

app.post("/signin", (req, res) => {
   pgr.select("email", "hash").from("login")
   .where("email", "=", req.body.email)
   .then(data =>{
       const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
       if (isValid){
           return pgr.select("*").from("users")
           .where("email", "=", req.body.email)
           .then(user => {
               res.json(user[0])
           })
           .catch(err => res.status(400).json("unable to get user"))
       } else {
           res.status(400).json("Invalid password")
       }
   })
   .catch(err => res.status(400).json("wrong email"))
})

app.post("/register", (req, res) => {
    const { email, name, password } =req.body;
    if (!email || !name || !password){
        return res.status(400).json("invalid")
} else {
    const hash = bcrypt.hashSync(password,salt);
    pgr.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into("login")
        .returning("email")
        .then(loginemail => trx("users")
            .returning("*")
            .insert({
                email: loginemail[0].email,
                name: name,
                joined: new Date()
            }).then(user => {
                res.json(user[0]);
            }))
            .then(trx.commit)
            .catch(trx.rollback)
    })
    
    .catch(err => res.status(400).json("unable to register"))
    
}
})

app.get("/profile/:id", (req, res) => {
    const { id } = req.params;
    pgr.select("*").from("users").where({id})
    .then(user => {
        if (user.length){
            res.json(user[0])
        } else {
            res.status(404).json("Not found")
        }
        
    })
    .catch(err => res.status(400).json("error getting user"))
})

app.put("/image", (req, res) => {
    const { id } = req.body;
    pgr("users").where("id", "=", id)
    .increment("enteries", 1)
    .returning("enteries")
    .then(enteries => {
        res.json(enteries[0].enteries);
    })
    .catch(err => res.status(400).json("error entries"))
})




const server_port = process.env.YOUR_PORT || process.env.PORT || 80;
const server_host = process.env.YOUR_HOST || '0.0.0.0';
app.listen(server_port, server_host, function() {
    console.log('Listening on port %d', server_port);
    console.log("url", process.env.DATABASE_URL)
});