FROM --platform=$BUILDPLATFORM node:21-alpine3.19 as build

WORKDIR /app

COPY package.json package-lock.json ./
RUN yarn install --immutable --frozen-lockfile

COPY . .
RUN yarn build

CMD ["tail", "-f", "/dev/null"]