#!/bin/sh

read -p "Have you updated the package version (y/n)? " answer
case ${answer:0:1} in
y | Y) ;;

*)
    echo "Please do so according to https://semver.org/"
    exit 1
    ;;
esac

# Check if docker exists
if [[ "$(docker -v 2>/dev/null)" == "" ]]; then
    printf -- 'You dont seem to have Docker installed.\n'
    printf -- 'Get it: https://www.docker.com/community-edition\n'
    printf -- 'Exiting with code 127...\n'
    exit 127
fi

printf -- 'Docker found.\n'

if [ "$(docker ps -q -f name=verdaccio)" ]; then
    printf -- '\033[37m Verdaccio already running, pulling down... \033[0m\n'
    docker stop verdaccio >/dev/null 2>&1
    printf -- '\033[32m SUCCESS: Pulled down Verdaccio instance \033[0m\n'
fi

printf -- '\033[37m Starting verdaccio... \033[0m\n'
docker run -d -it --rm --name verdaccio -p 4873:4873 verdaccio/verdaccio:4.2.1 >/dev/null 2>&1
docker start verdaccio 2>&1
until $(curl --output /dev/null --silent --head --fail http://localhost:4873); do
    printf '.'
    sleep 1
done
printf -- '\033[32m SUCCESS: Verdaccio is now running \033[0m\n'

printf -- '\033[37m Creating verdaccio user... \033[0m\n'
/usr/bin/expect <<EOD
        spawn npm adduser --registry http://localhost:4873
        expect {
            "Username:" {send "test\r"; exp_continue}
            "Password:" {send "test\r"; exp_continue}
            "Email: (this IS public)" {send "test@test@42.nl\r"; exp_continue}
        }
EOD

printf -- '\033[32m SUCCESS: verdaccio user created \033[0m\n'

# Compile version
printf -- '\033[37m Attempting to compile \033[0m\n'
npm run tsc
printf -- '\033[32m SUCCESS: Succesfully compiled \033[0m\n'

# Publish packages
printf -- '\033[37m Attempting to publish to verdaccio... \033[0m\n'
npm publish --registry http://localhost:4873
printf -- '\033[32m SUCCESS: Succesfully published packages \033[0m\n'

# Provide instructions
version=$(awk -F'"' '/"version": ".+"/{ print $4; exit; }' package.json)
printf -- '\033[32m Now go to your test project set the version of "@42.nl/spring-connect" to "%s" then run "npm install --registry http://localhost:4873" \033[0m\n' $version