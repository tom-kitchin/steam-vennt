<template>
  <section class="container">
    <div>ID: {{ steamId }}</div>
    <div>Count: {{ gameCount }}</div>
    <ul>
      <template v-for="game in sortedGames">
        <li>{{ game.name }}</li>
      </template>
    </ul>
  </section>
</template>

<script>
import axios from 'axios'
import _ from 'lodash'

export default {
  validate ({ params }) {
    // Steamid must exist
    return !!params.steamid
  },
  data () {
    return {
      steamId: this.$route.params.steamid
    }
  },
  async asyncData ({ params }) {
    let { data } = await axios.get(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=8352E343136E2141732540937BF4FAC0&steamid=${params.steamid}&include_appinfo=1`)
    return {
      gameCount: data.response.game_count,
      games: data.response.games
    }
  },
  computed: {
    sortedGames () {
      return _.sortBy(this.games, (game) => game.name)
    }
  }
}
</script>
