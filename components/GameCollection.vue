<template>
  <div>
    <h4>Games</h4>
    <hr>
    <ul class="list-group">
      <game v-for="game in gameCollection.games" :key="game.appId" :game="game" />
    </ul>
  </div>
</template>

<script>
import Game from '~/components/Game'

export default {
  props: {
    gameCollection: {
      required: true,
      type: Object
    }
  },
  components: {
    Game
  }
}
</script>
