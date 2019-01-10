FROM node:10.15-alpine
WORKDIR /app
COPY . .
RUN apk add --no-cache --virtual .gyp \
        python \
        make \
        g++ \
    && npm install \
    && apk del .gyp
RUN npm run build

VOLUME /app/sqlite
EXPOSE 3000
ENV STEAM_API_KEY=
ENV HOST=0.0.0.0

ENTRYPOINT ["/bin/sh", "start"]