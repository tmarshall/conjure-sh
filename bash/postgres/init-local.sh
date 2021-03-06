#! /bin/bash
# This initializes the local Postgres with needed fixtures

BASE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";
. $BASE/../functions.cfg;

# sudo su - postgres -c "createuser --createdb --adduser --no-password conjure_admin" 2> /dev/null;

cd $APP_DIR/sql/;
psql postgres --username=conjure_admin -w --file="init-$NODE_ENV.sql"; # --quiet;
