FROM node:latest
EXPOSE 3000
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
CMD yarn watch
