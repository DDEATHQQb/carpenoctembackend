const express = require('express');
const app = express();
const path = require('path');
const port = 8081;
const mysql = require("mysql");
//const http = require('http').Server(app);
// connect server 
const server = app.listen(port, ()=> {
    console.log(`Listening on port: ${port}`);
}); 
const io = require('socket.io').listen(server);

// call database and connect 
const dbcalled = require('./src/dbcall');
const db = mysql.createConnection(dbcalled);
db.connect((err)=>{
    if(err) {
        console.log('Cannot connect to database');
    }else {
        console.log('Database connected');
    }
});
//get view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug'); 
//set public dir
app.use(express.static('public'));

// app router
app.get('/', (req, res)=> {
    res.render('index');
});

// io
io.on('connection',(socket)=>{
    console.log('A user Connected');
    // socket.on('',(name,word,fn)=>{
    //     fn(`${name} says ${word}`)
    // });
    setTimeout(()=>{
        socket.send('Sent a message 5 seconds after connection!');
    },5000);

    const checkIfExist = 'SELECT username FROM SystemUser WHERE username = ?;';
    // socket.on('register',(req,res)=>{
    //     db.query(checkIfExist,[req.username],(error,result)=>{
    //         if(error)throw error;
    //         if(result.length!==0) {
    //             socket.emit('registerFail');     
    //         }else {
    //             const sql = 'INSERT INTO SystemUser(Username , pass_word) VALUES(?,?);'
    //             db.query(sql,[req.body.username , req.body.pass_word],(error)=>{
    //                 if(error) throw error ;
    //                 socket.emit('registerSuccess');
    //             })
    //         }
    //     });
    // });
    socket.on('login',(req,res)=>{
        db.query(checkIfExist,[req.username],(error,result)=>{
            if(error)throw error ;
            // cannot find username in database
            if(result.length==0){
                socket.emit('loginFail');
            }else {
                
            }
        })
    });
});




//export default App;