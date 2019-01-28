FROM buildkite/puppeteer:latest
RUN apt update && apt install -y git
RUN npm install seq-cli
ENV  PATH="${PATH}:/node_modules/.bin"
