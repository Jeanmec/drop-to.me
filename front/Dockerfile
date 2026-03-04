FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock ./
COPY front/package.json ./front/
COPY back/package.json ./back/
COPY libs/shared/package.json ./libs/shared/

RUN yarn install --frozen-lockfile

COPY libs/shared ./libs/shared
COPY front ./front

RUN yarn build:front

EXPOSE 3190

CMD ["yarn", "workspace", "front", "start"]
