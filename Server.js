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

    //const checkIfExist = 'SELECT username,pass_word FROM SystemUser WHERE username = ?;';
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
    socket.on("login", (data) => {
        console.log("enter back-end login");
        console.log(data.username);
        console.log(data.password);
        const checkIfExist =
          "SELECT userID FROM SystemUser WHERE username = ? and pass = ?;";
        db.query(checkIfExist, [data.username, data.password], (error, result) => {
          if (error) throw error;
          // cannot find username in database
          if (result.length == 0) {
            socket.emit("loginFail");
          } else {
            console.log(result[0].userID);
            socket.emit("loginSuccess", result[0]);
          }
        });
      });
    socket.on('createGroup',(data)=>{
        const checkIfExist = 'SELECT groupName FROM GroupChat WHERE groupName = ?;';
        db.query(checkIfExist,data.groupName,(error,result)=>{
            if(error)throw error ;
            if(result.length!=0){
                socket.emit('createGroupFail');
            }else {
                let sql = 'INSERT INTO GroupChat(groupName) VALUES(?);'
                db.query(sql ,data.groupName,(error)=>{
                    if(error) throw error;
                    socket.emit('groupCreated');
                    
                })
                
            }

        });
    });
    //already in group just enter group
    //isExit = 0 >> Enter GroupChat page
    socket.on('enterGroup',(data)=>{
        const sql = 'UPDATE JoinGroup SET isExit=0 WHERE JGuserId=? and JGgroupId=?;';
        const loadMsg = 'SELECT message FROM ChatLog WHERE messageId in (SELECT ChatmessageId \
            FROM Chat WHERE  ChatgroupId = ?);';
        db.query(sql,[data.ChatuserId,data.ChatgroupId],(error)=>{
            if(error) throw error ;
            db.query(loadMsg,data.ChatgroupId)
            
        })
    });
   
    //just exit a group
    socket.on('exitGroup',(data)=>{
        const sql = 'UPDATE JoinGroup SET isExit=1 and latestTimeRead=now() WHERE JGuserId=? and JGgroupId=?;';
        db.query(sql,[data.JGuserId,data.JGgroupId],(error)=>{
            if(error) throw error ;
            socket.on('exitGroupSuccess');
        });
    });
    // never join group
    socket.on('joinGroup',(data)=>{
        const sql = 'INSERT INTO JoinGroup(JGuserId, JGgroupID, isExit, latestTimeRead) VALUES(?,?,0,now());'
        const loadMsg = 'SELECT message,timeSend FROM ChatLog WHERE messageId in \
        (SELECT ChatmessageId FROM Chat WHERE ChatgroupId = ?);'
        let msg = [];
        db.query(sql,[data.JGuserId,data.JGgroupId],(error)=>{
            if(error)throw error;
            db.query(loadMsg,data.JGuserId,(error,result)=>{
                if(error)throw error;
                socket.emit('joinGroupSuccess', result);
            });
        });
    });
    
    socket.on('leaveGroup',(data)=>{
        const sql = 'DELETE FROM JoinGroup WHERE JGuserId=? and JGgroupId=?'
        db.query(sql,[data.JGuserId,data.JGgroupId],(error)=>{
            if(error) throw error ;
        });
    });

    socket.on('sendMsg',(data)=>{
        
        const savemsg = 'INSERT INTO ChatLog(message,timeSend) VALUES(?,now());';
        let sql = 'INSERT INTO Chat(ChatuserId,ChatgroupId,ChatmessageId) VALUES(?,?,LAST_INSERT_ID());';
        db.query(savemsg,[data.message],(error)=>{
            if(error) throw error ;
            db.query(sql,[data.ChatuserId,data.ChatgroupId],(error)=>{
                if(error) throw error ;
                sql = 'SELECT timeSend FROM ChatLog WHERE messageId = LAST_INSERT_ID();';
                db.query(sql,(error,result)=>{
                    sql =  'SELECT groupName FROM GroupChat WHERE groupID = ?'
                    const want = result[0];
                    db.query(sql , data.JGgroupId,(error,result)=>{
                        console.log(want+'\n'+result);
                        io.to(result[0]).emit('bigger-announcement', 'the tournament will start soon');//send to group
                        socket.emit('sendMsgSuccess',want);// send timestamp to frontend
                    });
                    
                    
                });    
                
            })
        });
    });

     socket.on('getUnreadMsg',(data)=>{
        const loadMsg = 'SELECT message,timeSend \
        FROM ChatLog INNER JOIN Chat INNER JOIN JoinGroup \
        ON ChatmessageID = messageID  AND ChatuserID = JGuserID AND ChatgroupID = JGgroupID \
        AND ChatgroupID = ? AND ChatuserID = ? \
        WHERE latestTimeRead <= timeSend;';
        console.log(data);
        db.query(loadMsg,[data.ChatuserID,data.ChatgroupId],(error,result)=>{
            if(error) throw error ;
            console.log(result);
            socket.emit(result);
        });
     });

     socket.on('getGroup',(data)=>{
        const sql = 'SELECT groupId,groupName FROM GroupChat \
        WHERE groupId IN (SELECT JGgroupId FROM JoinGroup WHERE JGuserId = ?);';
        console.log(data);
        db.query(sql,data.userID,(error,result)=>{
            if(error) throw error ;
            console.log(result);
            socket.emit('getGroupSuccess',result);
        });
    });
    socket.on('getOtherGroup',(data)=>{
        const sql = 'SELECT groupId,groupName FROM GroupChat \
        WHERE groupId NOT IN (SELECT JGgroupId FROM JoinGroup WHERE JGuserId = ?);';
        db.query(sql,data.userID,(error,result)=>{
            if(error) throw error ;
            console.log(result);
            socket.emit('getOtherGroupSuccess',result);
        });
    });

});




//export default App;