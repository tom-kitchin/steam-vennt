<template>
  <section class="container">
    <h3>Profiles</h3>
    <steam-profile-list v-model="steamProfiles" />
    <hr>
    <div v-show="commonGames.length > 0">
      <h2 v-if="readyGameCollections.length > 1">{{ commonGames.length || 'No' }} games in common</h2>
      <h2 v-else>{{ commonGames.length }} owned games</h2>
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
import SteamProfileList from '~/components/SteamProfileList'

export default {
  validate ({ params }) {
    // Steamid must exist
    return !!params.steamids
  },
  data () {
    return {
      steamProfiles: _(this.$route.params.steamids).split('+').map(function (steamId) {
        return {
          providedId: steamId,
          status: 'loading'
        }
      }).value(),
      gameCollections: {}
    }
  },
  computed: {
    readyGameCollections () {
      return _.filter(this.gameCollections, _.matches({ status: 'ready' }))
    },
    commonGames () {
      // Collect only the games of ready game collections.
      let gameLists = _(this.readyGameCollections)
        .map((gameCollection) => gameCollection.games)
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
    loadProfileGames (steamId) {
      this.gameCollections = {
        ...this.gameCollections,
        [steamId]: {
          steamId,
          status: 'loading'
        }
      }
      return steam.getSteamOwnedGames(steamId).then(({ data }) => {
        if (data.error) {
          this.gameCollections = {
            ...this.gameCollections,
            [steamId]: {
              steamId,
              status: 'error',
              error: data.error
            }
          }
        } else {
          this.gameCollections = {
            ...this.gameCollections,
            [steamId]: {
              steamId,
              gameCount: data.game_count,
              games: data.games,
              status: 'ready'
            }
          }
        }
      })
    },
    getIconUrl (game) {
      return steam.getIconUrl(game)
    }
  },
  components: {
    SteamProfileList
  },
  watch: {
    steamProfiles (newProfiles) {
      // We're looking for when a profile has just become ready.
      let steamIdsToLoad = _.difference(
        _(newProfiles).filter(_.matches({ status: 'ready' })).map('steamId').value(),
        _.keys(this.gameCollections)
      )
      _.each(steamIdsToLoad, (steamId) => {
        if (this.gameCollections[steamId] && this.gameCollections[steamId].status === 'loading') {
          // whoops, we already started loading this one.
          return
        }
        this.loadProfileGames(steamId)
      })
    }
  }
}
</script>
