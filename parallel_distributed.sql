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
groupName varchar(40) not null,
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
JGuserId int,
JGgroupId int,
isExit enum('0', '1'),
latestTimeRead timestamp not null,
primary key(JGuserId, JGgroupId),
foreign key(JGuserId) references SystemUser(userId)  on update cascade,
foreign key(JGgroupId) references GroupChat(groupId)  on update cascade
);

create table Chat
(
ChatuserId int,
ChatgroupId int,
ChatmessageId int,
primary key(ChatuserId, ChatgroupId, ChatmessageId),
foreign key(ChatuserId) references SystemUser(userId) on update cascade,
foreign key(ChatgroupId) references GroupChat(groupId) on update cascade,
foreign key(ChatmessageId) references ChatLog(messageId) on update cascade
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
    ('Drinking'),
    ('DPLOP');

insert into ChatLog
	(message, timeSend)
values
	('Hello World', '2019-03-02 20:45:20'),
    ('Eiei', '2019-03-03 11:50:13'),
    ('Algorithm Design so fun', '2019-03-05 04:04:00'),
    ('Parallel so ez','2019-03-05 04:04:00'),
    ('Parallel1 so ez','2019-03-05 05:14:00'),
    ('Parallel2 so ez','2019-03-05 06:24:00');

insert into JoinGroup
	(JGuserId, JGgroupId, isExit, latestTimeRead)
values
	(1, 1, '1', '2019-03-01 21:00:45'),
    (2, 2, '1', '2019-03-02 20:15:20'),
    (2, 1, '0', '2019-03-03 11:30:13'),
    (3, 1, '1', '2019-03-05 03:04:00');
    
    
insert into Chat
	(ChatuserId, ChatgroupId, ChatmessageId)
values
	(1, 1, 2),
    (2, 2, 3),
    (3, 2, 1),
    (2, 1, 4),
    (1, 1, 5),
    (2, 1, 6);
    