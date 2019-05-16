SET search_path = LIV4D_DB_TEST;

DROP SCHEMA IF EXISTS LIV4D_DB_TEST CASCADE;
CREATE SCHEMA LIV4D_DB_TEST;

create table if not exists LIV4D_DB_TEST.User(
	
	user_id		varchar(16)			unique not null,
	prenom		varchar(32)			not null,
	nom			varchar(32)			not null,
	courriel	varchar(64)			not null,
	hash		varchar						 ,
	salt		varchar						 ,
	isAdmin		boolean				not null,
	
	Primary Key(user_id) 
);

create table if not exists LIV4D_DB_TEST.TaskGroup(
	task_group_id			varchar(4)			unique not null,
	Titre					varchar(32)			unique not null,
	Description	text							,
	
	Primary Key(task_group_id)
);

Create table if not exists LIV4D_DB_TEST.Image(
	image_id			varchar(4)		unique not null,
	image_png			varchar			not null,
	image_preproc		varchar				not null,
	
	Primary key(image_id)
);

create table if not exists LIV4D_DB_TEST.Task(
	task_id			varchar(4)			unique not null,
	user_id			varchar(16)			,
	image_id		varchar(4)			not null,
	task_group_id	varchar(4)			not null,
	isComplete		boolean				not null default false,
	isVisible		boolean				not null default true,
	comment 		text				,
	
	Primary key(task_id, task_group_id),
	foreign key (user_id) references LIV4D_DB_TEST.User(user_id),
	foreign key(image_id)	references LIV4D_DB_TEST.Image(image_id),
	foreign key(task_group_id) references LIV4D_DB_TEST.TaskGroup on delete cascade
);

Create table if not exists LIV4D_DB_TEST.Annotation(
	annotation_id	varchar(4)		unique not null,
	image_id		varchar(4)		not null, --not null ?
	svg				varchar			not null,
	Comment			text			,
	
	Primary key(annotation_id, image_id),
	foreign key(image_id) references LIV4D_DB_TEST.Image(image_id) on delete restrict
);

create table if not exists LIV4D_DB_TEST.Evenement(
	evenement_id		varchar(4)		unique not null,
	image_id			varchar(4)		not null,
	annotation_id		varchar(4)		not null,
	user_id				varchar(16)		,
	date				date			not null,
	time_stamp			timestamp		,
	Primary key(evenement_id, annotation_id, image_id),
	foreign key(annotation_id, image_id) references LIV4D_DB_TEST.Annotation,
	foreign key(user_id) references LIV4D_DB_TEST.User(user_id)
);