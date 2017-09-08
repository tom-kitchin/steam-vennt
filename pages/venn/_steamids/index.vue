<template>
  <section class="container">
    <h2>Profiles</h2>
    <ul>
      <template v-for="profile in steamProfiles">
        <li v-if="profile.status === 'ready'">{{ profile.steamId }} - {{ profile.gameCount }}</li>
        <li v-else-if="profile.status === 'error'">{{ profile.steamId }} - ERROR: {{ profile.error }}</li>
        <li v-else>{{ profile.steamId }} - loading...</li>
      </template>
    </ul>
    <h2>{{ commonGames.length || 'No' }} games in common</h2>
    <ul>
      <li v-for="game in commonGames">{{ game.name }}</li>
    </ul>
  </section>
</template>

<script>
import _ from 'lodash'
import { client as steam } from '~/assets/steam'

export default {
  validate ({ params }) {
    // Steamid must exist
    return !!params.steamids
  },
  data () {
    return {
      steamProfiles: _(this.$route.params.steamids).split('+').map(function (steamId) {
        return [steamId, {
          steamId,
          status: 'loading'
        }]
      }).fromPairs().value()
    }
  },
  computed: {
    commonGames () {
      let gameLists = _(this.steamProfiles)
        .filter(_.matches({ status: 'ready' }))
        .map((profile) => profile.games)
        .value()
      return _.intersectionBy(...gameLists, 'appid')
    }
  },
  methods: {
    loadProfile (steamId) {
      return steam.getSteamOwnedGames(steamId)
    }
  },
  created () {
    _.each(this.steamProfiles, (profile) => {
      if (_.includes(['ready', 'error'], profile.status)) { return }
      let steamId = profile.steamId
      this.loadProfile(steamId).then(({ data }) => {
        if (data.error) {
          this.steamProfiles[steamId] = {
            steamId,
            status: 'error',
            error: data.error
          }
        } else {
          this.steamProfiles[steamId] = {
            steamId,
            gameCount: data.game_count,
            games: data.games,
            status: 'ready'
          }
        }
      })
    })
  }
}
</script>
