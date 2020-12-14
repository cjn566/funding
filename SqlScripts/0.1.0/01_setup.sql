create schema student;
create schema admin;
create schema lookup;

create table student.student(
	id serial primary key,
	name text not null,
	keyId text not null unique,
	dateCreated timestamp with time zone not null default (now() at time zone 'utc'),
	lastUpdated timestamp with time zone not null default (now() at time zone 'utc')
);

create table admin.user(
	id serial primary key,
	email text not null unique,
  first_name text not null,
  last_name text not null;
	password text not null,
  salt text not null,
  is_active boolean not null default true,
	dateCreated timestamp with time zone not null default (now() at time zone 'utc'),
	lastUpdated timestamp with time zone not null default (now() at time zone 'utc'),
  last_login timestamp with time zone
);
create table lookup.timePeriod (
  periodName text primary key,
	dateCreated timestamp with time zone not null default (now() at time zone 'utc'),
	lastUpdated timestamp with time zone not null default (now() at time zone 'utc')
);

create table lookup.dayOfWeek(
	id int,
	short text not null primary key,
	long text not null
);

insert into lookup.dayOfWeek values
(0, 'Sun', 'Sunday'),
(1, 'Mon', 'Monday'),
(2, 'Tue', 'Tuesday'),
(3, 'Wed', 'Wednesday'),
(4, 'Thur', 'Thursday'),
(5, 'Fri', 'Friday'),
(6, 'Sat', 'Saturday');

create table admin.bellSchedule(
	id serial primary key,
  periodName text not null references lookup.timePeriod,
  dayOfWeek text not null references lookup.dayOfWeek,
	startTime time with time zone not null,
	endTime time with time zone not null,
	dateCreated timestamp with time zone not null default (now() at time zone 'utc'),
	lastUpdated timestamp with time zone not null default (now() at time zone 'utc')
);

create table student.studentTimePeriod (
	studentId int references student.student not null,
	periodName text references lookup.timePeriod not null,
	dateAdded timestamp with time zone not null default (now() at time zone 'utc'),
	lastUpdated timestamp with time zone not null default (now() at time zone 'utc')
);

create table student.studentAccess(
	studentId int references student.student not null,
	periodName text references lookup.timePeriod not null,
  dayOfWeek text references lookup.dayOfWeek not null,
	success boolean not null,
	dateAdded timestamp with time zone not null default (now() at time zone 'utc')
);
