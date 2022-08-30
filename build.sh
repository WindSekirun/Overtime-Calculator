TAG=`git describe --exact-match --tags $(git log -n1 --pretty='%h')`
echo Building nexusstore.kohaku.moe/windsekirun/overtime-calculator:$TAG
docker build -t nexusstore.kohaku.moe/windsekirun/overtime-calculator:$TAG .
docker push nexusstore.kohaku.moe/windsekirun/overtime-calculator:$TAG