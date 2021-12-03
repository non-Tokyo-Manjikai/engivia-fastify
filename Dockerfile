FROM node:14.17.0 as builder

WORKDIR /app

COPY package.json yarn.lock /app/

ENV DATABASE_URL=${DATABASE_URL}

RUN yarn

COPY . /app

RUN yarn build

FROM node:14.17.0 as release

COPY --from=builder /app/dist /app/package.json /app/yarn.lock /app/prisma/schema.prisma /app/

ENV NODE_ENV=production
ENV DATABASE_URL=${DATABASE_URL}

WORKDIR /app
# NODE_ENVを production にすると、devDependenciesがインストールされない
RUN yarn

EXPOSE 8080

CMD [ "yarn", "start" ]
