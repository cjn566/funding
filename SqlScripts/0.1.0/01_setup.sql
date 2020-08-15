create schema student;
create schema admin;
create table student.student(
	id serial primary key,
	name text not null,
	keyId text not null,
	dateCreated timestamp with time zone not null default (now() at time zone 'utc'),
	lastUpdated timestamp with time zone not null default (now() at time zone 'utc')
);

create table admin.user(
	id serial primary key,
	email text not null,
	password text not null,
	dateCreated timestamp with time zone not null default (now() at time zone 'utc'),
	lastUpdated timestamp with time zone not null default (now() at time zone 'utc')
);
create table admin.userLogin(
	userId int references admin.user not null,
	dateLoggedIn timestamp with time zone not null default (now() at time zone 'utc')
);
create table admin.timePeriod(
	id serial primary key,
  periodName text,
	startTime time with time zone not null,
	endTime time with time zone not null,
	isActive boolean not null default true,
	dateCreated timestamp with time zone not null default (now() at time zone 'utc'),
	lastUpdated timestamp with time zone not null default (now() at time zone 'utc')
);

create table student.studentTimePeriod (
	studentId int references student.student not null,
	timePeriodId int references admin.timePeriod not null,
	isActive boolean not null default true,
	dateAdded timestamp with time zone not null default (now() at time zone 'utc'),
	lastUpdated timestamp with time zone not null default (now() at time zone 'utc')
);

create table student.studentAccess(
	studentId int references student.student not null,
	timePeriodId int references admin.timePeriod not null,
	dateAdded timestamp with time zone not null default (now() at time zone 'utc')
);
