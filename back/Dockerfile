FROM node:22

WORKDIR /app

COPY package.json yarn.lock ./
COPY back/package.json ./back/
COPY front/package.json ./front/
COPY libs/shared/package.json ./libs/shared/

RUN yarn install --frozen-lockfile

COPY libs/shared ./libs/shared
COPY back ./back

RUN yarn workspace @droptome/shared build && yarn workspace back build

EXPOSE 3000

CMD ["node", "back/dist/main"]
