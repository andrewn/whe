#!/bin/sh
### BEGIN INIT INFO
# Provides:          sender
# Required-Start:    $remote_fs $syslog
# Required-Stop:     $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Wifi sender
# Description:       Uses Airmon and Airodump to track wifi mac addresses
### END INIT INFO
# Quick start-stop-daemon example, derived from Debian /etc/init.d/ssh
set -e

export PATH=$PATH:/usr/local/bin:/opt/node/bin
export LOG_LEVEL=debug
export PIDFILE=/var/run/whe-image-sender.pid
export PORT=3000

NAME=image-sender

export PATH="${PATH:+$PATH:}/usr/sbin:/sbin"

case "$1" in
  start)
    echo -n "Starting: "$NAME
    start-stop-daemon --start --quiet --background --no-close --make-pidfile --pidfile $PIDFILE --exec /opt/node/bin/node /home/pi/whe/emitter/sender/imageSender.js > /var/log/$NAME_start.log 2>&1
    echo "."
    ;;
  stop)
    echo -n "Stopping: "$NAME
    start-stop-daemon --stop --quiet --oknodo --pidfile $PIDFILE
    rm $PIDFILE
    echo "."
    ;;
  *)
    echo "Usage: "$1" {start|stop}"
    exit 1
esac

exit 0
