#! /bin/bash
# This is called when you `npm start` for Development - it boots up docker, which will then (possibly) build, and then init the running docker instance

BASE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";
. $BASE/../functions.cfg;

npm run-script build;

if [ ! -d "$APP_DIR/node_modules" ]; then
  progress "Installing modules";
  npm install;
fi

npm run-script compile --watch > $APP_DIR./webpack-build.log 2>/dev/null &
PIDS[0]=$!;

eval "$(docker-machine env cosmo)";

APP_IP=$(docker-machine ip cosmo);
progress "Connecting to Docker";
docker run -i -t \
  -p 80:3000 \
  -v $APP_DIR:$DESTINATION_DIR \
  -w $DESTINATION_DIR \
  --dns 4.4.4.4 --dns 8.8.4.4 \
  -e NODE_ENV="${NODE_ENV}" \
  -e APP_IP="${APP_IP}" \
  cosmo/latest bash;

trap "kill ${PIDS[*]} && wait ${PIDS[*]} 2>/dev/null" SIGINT;
wait;