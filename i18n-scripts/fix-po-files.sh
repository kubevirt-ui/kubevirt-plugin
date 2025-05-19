#!/bin/bash

sed -i -r "s|plural=(n != 1)|plural=(n != 1);|g" ./po-files/es/plugin__kubevirt-plugin.po
sed -i -r "s|plural=(n >= 2)|plural=(n >= 2);|g" ./po-files/fr/plugin__kubevirt-plugin.po 
sed -i -r "s|plural=0|plural=0;|g" ./po-files/ja/plugin__kubevirt-plugin.po \
    ./po-files/ko/plugin__kubevirt-plugin.po \
    ./po-files/zh-cn/plugin__kubevirt-plugin.po
