#!/bin/bash

echo "preparing for husky"
if [[ $APP_ENV != "production" ]]; then husky install; fi