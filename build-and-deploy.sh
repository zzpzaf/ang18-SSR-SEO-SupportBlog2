#!/bin/bash

# clear
ng build --verbose 
# ng build
rm -rf ~/DOCKER_SHARE1/net2/frontend/nginx/wwwroot/*
cp -a dist/ang18-SSR-SEO-SupportBlog2/browser/. ~/DOCKER_SHARE1/net2/frontend/nginx/wwwroot/browser
cp -a dist/ang18-SSR-SEO-SupportBlog2/server/. ~/DOCKER_SHARE1/net2/frontend/nginx/wwwroot/server