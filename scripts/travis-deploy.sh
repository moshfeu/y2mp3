ENVS=`env | grep -iE '^(DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS|APPVEYOR_|CSC_|_TOKEN|_KEY|AWS_|STRIP|BUILD_)([A-Z]|_)*=' | sed -n '/^[^\t]/s/=.*//p' | sed '/^$/d' | sed 's/^/-e /g' | tr '\n' ' '`
if [ "$TRAVIS_OS_NAME" == "linux" ]; then
  docker run $ENVS --rm \
    -v ${PWD}:/project \
    -v ~/.cache/electron:/root/.cache/electron \
    -v ~/.cache/electron-builder:/root/.cache/electron-builder \
    electronuserland/builder:wine \
    /bin/bash -c "npm run publish-linux"
else
  npm run electron-builder
fi