# steam-vennt

> Pick the game night game easily with a venn diagram of your friends' steam games

[Check out the live build!](http://vennt.twodaemon.co.uk)

This is Vennt, a browser-based web toy for finding out what games you and your friends have in common. Good for easily finding something you can all play on game night or just for finding out who has the best taste in games. It makes venn diagrams, because they're pretty and because the terrible pun name was too good to pass up.

## Build Details

Vennt is written in JS and Node using [Nuxt](https://nuxtjs.org/) - a [Vue](https://vuejs.org/) server side framework - for the site and [Express](https://expressjs.com/) for the API backend.

The API in turn makes requests to the Steam APIs while keeping to their fairly restrictive rate limit rules, which is why it can occasionally be a bit slow to respond. Requests are cached for a limited time, but Vennt isn't much use if it isn't up to date. It only ever gets public data from Steam - private profiles are marked as such in the UI and not queried.

The original tag database is pulled from [SteamSpy](http://steamspy.com/)'s API, and then kept up to date with queued requests to the (even more rate limited) Steam store API as necessary. This means that if you own a game Vennt has never seen before, it may display incorrect tags for it until the next time you visit.

## Build Setup

``` bash
# install dependencies
$ npm install # Or yarn install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start
```
