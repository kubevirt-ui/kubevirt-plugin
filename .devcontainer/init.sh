#!/bin/bash

if [[ ! -f .devcontainer/dev.env ]]
then
    echo 'env file 'dev.env' does not exist in .devcontainer, aborting.'
    exit 2
else
    echo 'found 'dev.env' in .devcontainer, proceeding.'
fi
