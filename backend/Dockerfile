FROM node:20-alpine AS build

WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . ./

RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 4000
CMD ["node", "server.js"]
