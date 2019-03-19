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
lastestTimeRead timestamp not null,
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
	('Dream Team');
