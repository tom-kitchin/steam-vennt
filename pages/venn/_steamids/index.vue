<template>
  <section class="container">
    <h3>Profiles</h3>
    <steam-profile-list v-model="steamProfiles" />
    <hr>
    <venn v-if="readyForVenn" :datum="vennDatum" @segmentSelected="selectDisplayedCollection" />
    <div v-if="currentGameCollection">
      <h4 v-if="currentGameCollection.steamIds.length > 1">{{ currentGameCollectionNameSentence }} have {{ currentGameCollection.gameCount || 'no' }} games in common</h4>
      <h4 v-else>{{ currentGameCollectionNameSentence }} owns {{ currentGameCollection.gameCount }} games</h4>
      <table class="table">
        <tr v-for="game in currentGameCollection.games">
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
import subsets from '~/assets/js/subset'
import SteamProfileList from '~/components/SteamProfileList'
import Venn from '~/components/Venn'

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
      gameCollections: {},
      displayedCollection: []
    }
  },
  computed: {
    readyGameCollections () {
      return _.filter(this.gameCollections, _.matches({ status: 'ready' }))
    },
    readySteamIdCombinations () {
      // Collect the steam IDs of ready game collections.
      let steamIds = _.map(this.readyGameCollections, (gameCollection) => gameCollection.steamId)
      // Get all possible subsets of the set of game collections.
      let sets = []
      for (let subset of subsets(steamIds)) {
        if (subset.length > 0) {
          sets = [
            ...sets,
            subset
          ]
        }
      }
      return sets
    },
    commonGames () {
      return _.map(this.readySteamIdCombinations, (steamIds) => {
        // Get the lists of games for each steam ID.
        let gameLists = _.map(steamIds, (steamId) => {
          return this.gameCollections[steamId].games
        })
        // Get the intersection of all subsets of games on those lists.
        gameLists = _.intersectionBy(...gameLists, 'appid')
        // Sort the list alphabetically, ignoring 'The' prefixes.
        gameLists = _.sortBy(gameLists, (game) => {
          let sortName = _.lowerCase(game.name)
          if (_.startsWith(sortName, 'the ')) {
            sortName = sortName.slice(4)
          }
          return sortName
        })
        return {
          steamIds: steamIds,
          names: _(this.steamProfiles).filter((profile) => _.includes(steamIds, profile.steamId)).map((profile) => profile.name).value(),
          games: gameLists,
          gameCount: gameLists.length
        }
      })
    },
    currentGameCollection () {
      return _.find(this.commonGames, (gameSet) => _.isEqual(gameSet.steamIds.sort(), this.displayedCollection.sort()))
    },
    currentGameCollectionNameSentence () {
      if (this.currentGameCollection.names.length === 0) { return '' }
      if (this.currentGameCollection.names.length === 1) { return this.currentGameCollection.names[0] }
      return `${_(this.currentGameCollection.names).slice(0, this.currentGameCollection.names.length - 1).join(', ')} and ${_.last(this.currentGameCollection.names)}`
    },
    readyForVenn () {
      // Venn seems to be unhappy if we repeatedly rebuild it while stuff is loading in,
      // so let's wait until all our ducks are in a row.
      if (_.isEmpty(this.gameCollections)) { return false }
      return _.every(this.gameCollections, (gameCollection) => {
        return _.includes(['ready', 'error'], gameCollection.status)
      })
    },
    vennDatum () {
      return _.map(this.readySteamIdCombinations, (steamIdCombination) => {
        let data = {
          sets: steamIdCombination,
          size: _.find(this.commonGames, (gameSet) => _.isEqual(gameSet.steamIds.sort(), steamIdCombination.sort())).gameCount
        }
        if (steamIdCombination.length === 1) {
          data.label = _.find(this.steamProfiles, _.matches({ steamId: steamIdCombination[0] })).name
        }
        return data
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
          this.displayedCollection = [
            ...this.displayedCollection,
            steamId
          ]
        }
      })
    },
    selectDisplayedCollection (set) {
      this.displayedCollection = set
    },
    getIconUrl (game) {
      return steam.getIconUrl(game)
    }
  },
  components: {
    SteamProfileList,
    Venn
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
