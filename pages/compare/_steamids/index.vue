<template>
  <section class="container">
    <ul>
      <template v-for="profile in steamProfiles">
        <li v-if="profile.status === 'ready'">{{ profile.steamId }} - {{ profile.gameCount }}</li>
        <li v-else-if="profile.status === 'error'">{{ profile.steamId }} - ERROR: {{ profile.error }}</li>
        <li v-else>{{ profile.steamId }} - loading...</li>
      </template>
    </ul>
  </section>
</template>

<script>
import _ from 'lodash'
import steam from '~/assets/steam'

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
  methods: {
    loadProfile (steamId) {
      return steam.client.getSteamOwnedGames(steamId)
    }
  },
  created () {
    _.each(this.steamProfiles, (profile) => {
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
