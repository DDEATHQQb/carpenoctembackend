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

    const checkIfExist = 'SELECT username,pass_word FROM SystemUser WHERE username = ?;';
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
    socket.on('login',(data)=>{
        const checkIfExist = 'SELECT username,pass_word FROM SystemUser WHERE username = ? and pass = ?;';
        db.query(checkIfExist,[data.username,data.password],(error,result)=>{
            if(error)throw error ;
            // cannot find username in database
            if(result.length==0){
                socket.emit('loginFail');
            }else {
                socket.emit('loginSuccess');
            }
        })
    });
    socket.on('CreateGroup',(data)=>{
        const checkIfExist = 'SELECT groupName FROM GroupChat WHERE groupName = ?;';
        db.query(checkIfExist,data.groupName,(error,result)=>{
            if(error)throw error ;
            if(result.length==0){
                socket.emit('CreateGroupFail');
            }else {
                let sql = 'INSERT INTO GroupChat(groupName) VALUES(?);'
                db.query(sql ,data.groupName,(error)=>{
                    if(error) throw error;
                    socket.emit('GroupCreated');
                    
                })
                
            }

        });
    });
    //already in group just enter group
    //isExit = 0 >> Enter GroupChat page
    socket.on('EnterGroup',(data)=>{
        const sql = 'UPDATE JoinGroup SET isExit=0 WHERE userId=? and groupId=?;';
        const loadMsg = 'SELECT message FROM ChatLog WHERE messageId in (SELECT messageId FROM Chat WHERE userId = ? and groupId = ?);';
        db.query(sql,[data.groupId,data.userId],(error)=>{
            
        })
    });
    // never join group
    socket.on('JoinGroup',(data)=>{
        const sql = 'INSERT INTO JoinGroup(userId,groupID,isExit,latestTimeRead) VALUES(?,?,0,0);'
        const loadMsg = 'SELECT * FROM '
        db.query(sql,[data.groupId,data.userId],(error)=>{
            socket.emit('JoinGroupSuccess');
        });

    });
    
    socket.on('LeaveGroup',(data)=>{
        
        
    });

    socket.on('SendMsg',(data)=>{
        const sql = 'INSERT INTO Chat(userId,groupId,messageId) VALUES(?,?,?);';
        db.query(sql,[data.userId,data.groupId,data.messageId],(error)=>{
            if(error) throw error ;
            socket.emit('SendMsgSuccess');

        });
    });
});




//export default App;