# KeyCardAccess
Simple tracking of school ids against a timeframe based database for library access.

You will need to set up a .env file with:

PGHOST=
PGPORT=
PGDATABASE=
PGUSER=
PGPASSWORD=
DATABASE_URL=postgres://

ROOT_URL=http://localhost:3000


You will need to run 01_setup.sql in the SqlScripts folder, and then `npm run dev` and you are good to go.
