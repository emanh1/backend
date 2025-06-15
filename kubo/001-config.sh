#!/bin/bash

set -ex
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost", "http://127.0.0.1"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '["Authorization"]'