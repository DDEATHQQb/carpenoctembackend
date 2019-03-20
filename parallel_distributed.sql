drop database if exists parallel_distributed;

create database parallel_distributed;

use parallel_distributed;

create table SystemUser
(
userId int auto_increment,
username varchar(12) not null,
pass varchar(12) not null,
primary key(userID)
);

create table GroupChat
(
groupId int auto_increment,
groupName varchar(20) not null,
primary key(groupId)
);

create table ChatLog
(
messageId int auto_increment,
message varchar(100) not null,
timeSend timestamp not null,
primary key(messageId) 
);

create table JoinGroup
(
userId int,
groupId int,
isExit enum('0', '1'),
latestTimeRead timestamp not null,
primary key(userId, groupId),
foreign key(userId) references SystemUser(userId) on delete cascade on update cascade,
foreign key(groupId) references GroupChat(groupId) on delete cascade on update cascade
);

create table Chat
(
userId int,
groupId int,
messageId int,
primary key(userId, groupId, messageId),
foreign key(userId) references SystemUser(userId) on delete cascade on update cascade,
foreign key(groupId) references GroupChat(groupId) on delete cascade on update cascade,
foreign key(messageId) references ChatLog(messageId) on delete cascade on update cascade
);


insert into SystemUser
	(username, pass)
values
	('oak123', '123456789'),
    ('nook123', '123456789'),
    ('earth123', '123456789');
    
    
insert into GroupChat
	(groupName)
values
	('Dream Team'),
    ('Road To Conqueror'),
    ('Drinking for your life');
    

insert into ChatLog
	(message, timeSend)
values
	('Hello World', '2019-03-12'),
    ('Eiei', '2019-02-10'),
    ('Algorithm Design so fun', '2019-03-19');
    

insert into JoinGroup
	(userId, groupId, isExit, latestTimeRead)
values
	(1, 1, '1', '2019-03-01'),
    (2, 2, '1', '2019-03-02'),
    (2, 1, '0', '2019-02-03'),
    (3, 1, '1', '2019-03-20');
    
    
insert into Chat
	(userId, groupId, messageId)
values
	(1, 1, 2),
    (1, 2, 3),
    (2, 2, 1),
    (3, 3, 1);