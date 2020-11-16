//const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

/*express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
*/


const express = require('express');
const app = express();
const session = require('express-session');
const mysql = require("mysql");
const dbconfig = require("./dbconfig.js");

// parse HTTP POST Data 
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // accept json data

// put client-side code (html/css/js) in the frontend folder
app.use(express.static(path.join(__dirname, 'frontend')));


app.use(session({
    secret: 'keyboard cat', 
    cookie: { maxAge: 600000 }, 
    resave: true,
    saveUninitialized: true}
));

connection = mysql.createConnection(process.env.JAWSDB_MARIA_URL || dbconfig.dbSettings);
connection.connect((err) => {
    if(err) {
        console.log('Error connecting to DB: change connection settings!');
    } else {
        console.log('Connection established!');
    }
});

function checkAuthorization(req, res, allowedRoles) {
    if (req.session.user === undefined || allowedRoles.indexOf(req.session.user.urole) == -1) {
        res.status(401).send("You are not authorized");
        return false;
    }
    return true;
}



// login
app.post("/login", (req, res) => {
    connection.query("SELECT * FROM users where uname='" + req.body.uname + "' and pw='" + req.body.pw +"'", 
    (err, rows) => {
        if(err) throw err;
        if (rows.length == 1) {
            console.log("login ok!");
            req.session.user = {
                id: rows[0].id,
                name: rows[0].uname,
                urole: rows[0].urole
            };
            if (req.session.user.   urole == 'T') {
                res.redirect('teacher.html');
            } else {
                res.redirect('student.html');
            }
        } else {
            res.status(401).send("Wrong username or password!");
        }
    });
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get("/students", (req, res) => {
    connection.query("SELECT id,uname FROM users where urole=?", 'S', 
    (err, rows) => {
        if(err) throw err;
        res.json(rows);
    });
});


app.get("/exercises", (req, res) => {
    if (!checkAuthorization(req, res, ['S', 'T'])) 
        return;
    connection.query("SELECT * FROM exercises order by id", (err, rows) => {
            if(err) throw err;
            res.json(rows);
    });
});


app.get("/user/exercises", (req, res) => {
    if (!checkAuthorization(req, res, ['S', 'T'])) 
        return;
    connection.query("SELECT * FROM exercises where" + 
                    " id not in(select exercise_id from submissions where student_id=?) order by id",
                    req.session.user.id, (err, rows) => {
            if(err) throw err;
            res.json(rows);
        });
});

app.post("/exercises", (req, res) => {
    if (!checkAuthorization(req, res, ['T']))
        return;
    connection.query("INSERT INTO exercises (description) values (?)", req.body.description, 
        (err, result) => {
            if(err) throw err;
            console.log("created a new exercise with id ", result.insertId);
            res.json({id: result.insertId});
        }
    );
}); 


app.get("/submissions", (req, res) => {
    if (!checkAuthorization(req, res,  ['T']))
        return;
    connection.query("SELECT s.id as submission_id,e.id as exercise_id,u.uname as uname," + 
                    "e.description as description,s.msg as msg, s.rating as rating " + 
                    "FROM submissions s,exercises e,users u " +
                    "where e.id=s.exercise_id and s.student_id=u.id order by e.id",
    (err, rows) => {
        if(err) throw err;
        res.json(rows);
    });
});

app.get("/user/submissions", (req, res) => {
    connection.query("SELECT e.id as exercise_id,e.description as description,s.id as submission_id,s.rating as rating " +
                    " FROM submissions s,exercises e " +
                    "where e.id=s.exercise_id and s.student_id=? order by e.id", req.session.user.id,
    (err, rows) => {
        if(err) throw err;
        res.json(rows);
    });
});

app.post("/submissions", (req, res) => {
    if (!checkAuthorization(req, res, ['S']))
        return;
    connection.query("INSERT INTO submissions (msg, exercise_id, student_id) values (?, ?, ?)", 
        [req.body.msg, req.body.exercise_id, req.body.student_id || req.session.user.id], 
        (err, result) => {
            if(err) throw err;
            console.log("created a new submission with id ", result.insertId);
            res.json({id: result.insertId});
        }
    );
});

app.patch("/submissions/:id", (req, res) => {
    connection.query("update submissions set rating=? where id=?", 
        [req.body.rating, req.params.id], 
        (err, result) => {
            if(err) throw err;
            console.log("update: ", result.affectedRows);
            res.json({"update": result.affectedRows});
        }
    );
});


app.listen(PORT, () => {
    console.log(`Everyone Learns Listening on ${ PORT }`);
});