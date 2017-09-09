<template>
  <section class="container">
    <h3>Profiles</h3>
    <ul class="list-group">
      <template v-for="profile in steamProfiles">
        <li v-if="profile.status === 'ready'" class="list-group-item list-group-item-primary">{{ profile.steamId }} - {{ profile.gameCount }} games</li>
        <li v-else-if="profile.status === 'error'" class="list-group-item list-group-item-warning">{{ profile.steamId }} - ERROR: {{ profile.error }}</li>
        <li v-else class="list-group-item list-group-item-secondary">{{ profile.steamId }} - loading...</li>
      </template>
    </ul>
    <hr>
    <div v-show="commonGames.length > 0">
      <h2>{{ commonGames.length || 'No' }} games in common</h2>
      <table class="table">
        <tr v-for="game in commonGames">
          <td><img :src="getIconUrl(game)" /></td>
          <td>{{ game.name }}</td>
        </tr>
      </table>
    </div>
  </section>
</template>

<script>
import _ from 'lodash'
import { client as steam } from '~/assets/js/steam'

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
      // Collect only the games of ready profiles.
      let gameLists = _(this.steamProfiles)
        .filter(_.matches({ status: 'ready' }))
        .map((profile) => profile.games)
        .value()
      // Get the intersection of games on those lists.
      gameLists = _.intersectionBy(...gameLists, 'appid')
      // Sort the list alphabetically, ignoring 'The' prefixes.
      return _.sortBy(gameLists, (game) => {
        let sortName = _.lowerCase(game.name)
        if (_.startsWith(sortName, 'the ')) {
          sortName = sortName.slice(4)
        }
        return sortName
      })
    }
  },
  methods: {
    loadProfile (steamId) {
      return steam.getSteamOwnedGames(steamId)
    },
    getIconUrl (game) {
      return steam.getIconUrl(game)
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
