const express = require('express');
const bodyParser = require('body-parser')
const mongodb = require('mongodb')
const crypto = require('crypto');
const { copyFileSync } = require('fs');
const { remove } = require('lodash');
const dbname = '0antkowiak';
const url = 'mongodb://0antkowiak:pass0antkowiak@172.20.44.25/0antkowiak';

var db;
mongodb.MongoClient.connect(url, function (err, client) {
    if (err) return console.log(err)
    db = client.db(dbname);
    console.log('MongoDB connection OK');
})

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"));

app.listen(2040, function () {
    console.log('listening on 2040')
})

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/main.html')
})

app.get('/login', function (req, res) {
    res.sendFile(__dirname + '/client/login.html')
})

app.post('/login', function (req, res) {
    userExist(req.body, exists => {
        if (!exists) {
            res.status(401).end();
        } else {
            res.contentType('application/json');
            res.send(createAndSafeApiKey(req.body));
        }
    }, true);
})

app.delete("/login/:login", function (req, res) {
    const key = req.header("x-api-key");
    removeKey(key, req.params.login);
    res.end();
})

app.get('/register', function (req, res) {
    res.sendFile(__dirname + '/client/register.html')
})

app.post('/register', function (req, res) {
    userExist(req.body, exsits => {
        if (exsits) {
            res.status(409).end();
        } else {
            registerUser(req.body);
            res.contentType("application/json");
            res.send({ location: "/login" });
        }
    })
})

app.get("/saves/:login", function (req, res) {
    console.log("get saves")
    if (authenticateKey(req.params, req.header("x-api-key"))) {
        sendSaves(req, res);
    } else {
        res.status(401).end();
    }
})

app.post("/saves/:login", function (req, res) {
    if (authenticateKey(req.params, req.header("x-api-key"))) {
        saveSave(req, res);
    } else {
        res.sendStatus(401);
    }
})

app.delete("/saves/:login", function (req, res) {
    if (authenticateKey(req.params, req.header("x-api-key"))) {
        deleteSaves(req, res);
    } else {
        res.sendStatus(401);
    }
})

function userExist(credentials, callback, checkPass = false) {
    db.collection('users').findOne({ "login": credentials.login }, function (err, result) {
        if (err) return console.log(err);

        callback(result &&
            (!checkPass || result.pass === crypto.createHash("md5").update(credentials.pass).digest("base64")));
    });
}

function registerUser(credentials) {
    db.collection('users').insertOne(
        {
            login: credentials.login,
            pass: crypto.createHash("md5").update(credentials.pass).digest("base64")
        }, function (err, res) {
            if (err) return console.log(err);
        });
}

var savedKeys = [];

function createAndSafeApiKey(credentials) {
    const key = generateApiKey();
    const hashedKey = generateSecretHash(key);
    savedKeys.push({ login: credentials.login, hashedKey: hashedKey });
    return { api_key: key };
}

function removeKey(key, login) {
    if (key && login) {
        savedKeys = savedKeys.filter(user => {
            !(user.login == login
                && compareKeys(user.hashedKey, key)
            )
        });
    }
}

function authenticateKey(credentials, key) {
    if (!key) {
        console.log("key undefined");
        return false;
    }

    const user = savedKeys.find(user => user.login == credentials.login);
    return (user && compareKeys(user.hashedKey, key));
}

function generateApiKey() {
    return crypto.randomBytes(32).toString("base64");
}

function generateSecretHash(key) {
    const salt = crypto.randomBytes(8).toString('base64');
    const buffer = crypto.scryptSync(key, salt, 64);
    return `${buffer.toString('base64')}.${salt}`;
}

function compareKeys(storedKey, suppliedKey) {
    const [hashedPassword, salt] = storedKey.split('.');
    const buffer = crypto.scryptSync(suppliedKey, salt, 64);
    return crypto.timingSafeEqual(Buffer.from(hashedPassword, 'base64'), buffer);
}

function saveSave(req, res) {
    db.collection('saves').insertOne(
        {
            login: req.params.login,
            sortName: req.body.sortName,
            n: req.body.n
        }, function (err, result) {
            if (err || result.insertedCount == 0) {
                res.sendStatus(409);
                return console.log(err);
            }
            res.sendStatus(201);
        });
}

function sendSaves(req, res) {
    db.collection('saves').find(
        {
            login: req.params.login
        },
        {
            _id: 0, sortName: 1, n: 1
        }).toArray(
            function (err, result) {
                if (err) {
                    res.sendStatus(409);
                    return console.log(err);
                }
                res.contentType("application/json");
                res.send({ saves: result.filter(row => row.n && row.sortName) });
            });
}

function deleteSaves(req, res) {
    db.collection('saves').deleteMany(
        {
            login: req.params.login
        }, function (err, result) {
            if (err) {
                res.sendStatus(409);
                return console.log(err);
            }
            res.sendStatus(200);
        });
}
