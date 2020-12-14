create schema student;
create schema admin;
create schema lookup;

create table student.student(
	id serial primary key,
	name text not null,
	key_id text not null unique,
  is_active boolean not null default true,
	date_created timestamp with time zone not null default (now() at time zone 'utc'),
	last_updated timestamp with time zone not null default (now() at time zone 'utc')
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
  id serial primary key,
  periodName text not null unique,
  is_active boolean not null default true,
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
  period_id int not null references lookup.timePeriod,
  day_of_week text not null references lookup.dayOfWeek,
	start_time time without time zone not null,
	end_time time without time zone not null,
	date_created timestamp with time zone not null default (now() at time zone 'utc'),
	last_updated timestamp with time zone not null default (now() at time zone 'utc')
);

create table student.studentTimePeriod (
	student_id int references student.student not null,
	period_id int references lookup.timePeriod not null,
	date_created timestamp with time zone not null default (now() at time zone 'utc'),
	last_updated timestamp with time zone not null default (now() at time zone 'utc')
);

create table student.studentAccess(
	student_id int references student.student not null,
	period_id int references lookup.timePeriod not null,
  day_of_week text references lookup.dayOfWeek not null,
	success boolean not null,
	date_created timestamp with time zone not null default (now() at time zone 'utc'),
	last_updated timestamp with time zone not null default (now() at time zone 'utc')
);
