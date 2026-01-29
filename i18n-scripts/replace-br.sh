#!/bin/bash

sed -i -r "s|<br/>|<br />|g" ./locales/en/plugin__kubevirt-plugin.json \
./locales/es/plugin__kubevirt-plugin.json \
./locales/fr/plugin__kubevirt-plugin.json \
./locales/ja/plugin__kubevirt-plugin.json \
./locales/ko/plugin__kubevirt-plugin.json \
./locales/zh/plugin__kubevirt-plugin.json
