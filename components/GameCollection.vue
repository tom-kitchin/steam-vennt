<template>
  <div>
    <h4 v-if="gameCollection.steamIds.length > 1">{{ gameCollectionNameSentence }} have {{ gameCollection.gameCount || 'no' }} games in common</h4>
    <h4 v-else>{{ gameCollectionNameSentence }} owns {{ gameCollection.gameCount }} games</h4>
    <table class="table">
      <game v-for="game in gameCollection.games" :game="game" />
    </table>
  </div>
</template>

<script>
import _ from 'lodash'
import Game from '~/components/Game'

export default {
  props: {
    gameCollection: {
      required: true,
      type: Object
    }
  },
  computed: {
    gameCollectionNameSentence () {
      if (this.gameCollection.names.length === 0) { return '' }
      if (this.gameCollection.names.length === 1) { return this.gameCollection.names[0] }
      return `${_(this.gameCollection.names).slice(0, this.gameCollection.names.length - 1).join(', ')} and ${_.last(this.gameCollection.names)}`
    }
  },
  components: {
    Game
  }
}
</script>
