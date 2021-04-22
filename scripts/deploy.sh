echo $(pwd)
npm run build

scp -r build/* root@yurtsiv.me:/var/www/html