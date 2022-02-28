import express, { response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import knex from "knex";
import bcrypt from "bcryptjs"


var salt = bcrypt.genSaltSync(10);

const pgr = knex ({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port : 5432,
      user : 'postgres',
      password : 'test',
      database : 'test'
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
    if (email || name || password){
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
} else {
    return res.status(400).json("unable to register")
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



// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });

// app.listen(process.env.PORT || 5000, () => {
//     console.log("running");
// })

const server_port = process.env.YOUR_PORT || process.env.PORT || 80;
const server_host = process.env.YOUR_HOST || '0.0.0.0';
app.listen(server_port, server_host, function() {
    console.log('Listening on port %d', server_port);
});