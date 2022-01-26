#!/usr/bin/env bash

set -u

public_path="$1"
shift
server_opts="$@"

http-server $public_path -p 9001 -S true -C /var/serving-cert/tls.crt -K /var/serving-cert/tls.key -c-1 --cors $server_opts