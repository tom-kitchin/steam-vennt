<template>
  <div>
    <div class="game-collection-controls">
      <div class="tag-sort">
        <span class="text-muted m-1">Sort by tag:</span>
        <a
          v-for="(icon, tag) in tagIcons"
          :key="tag"
          class="btn btn-sm m-1"
          :class="getActiveSortClass(tag)"
          href="#"
          @click.prevent="setTagSort(tag)"
        >
          <i :class="['fa', `fa-${icon}`]" aria-hidden="true"></i>
          <span class="tag-text">{{ tag }}</span>
        </a>
      </div>
    </div>
    <hr>
    <ul class="list-group">
      <game
        v-for="game in sortedGameCollection"
        :key="game.appId"
        :game="game"
        :tagIcons="tagIcons"
      />
    </ul>
  </div>
</template>

<script>
import Game from '~/components/Game'
import _ from 'lodash'

export default {
  props: {
    gameCollection: {
      required: true,
      type: Object
    },
    defaultSort: {
      required: false,
      type: Object,
      default () { return {} }
    }
  },
  data () {
    return {
      tagIcons: {
        'Massively Multiplayer': 'globe',
        'Local Multiplayer': 'gamepad',
        'Multiplayer': 'sitemap',
        'Co-op': 'heart'
      },
      sort: this.defaultSort
    }
  },
  computed: {
    sortedGameCollection () {
      if (this.sort.tag) {
        return [
          ..._.filter(this.gameCollection.games, (game) => _.includes(game.tags, this.sort.tag)),
          ..._.reject(this.gameCollection.games, (game) => _.includes(game.tags, this.sort.tag))
        ]
      }
      return this.gameCollection.games
    }
  },
  methods: {
    setTagSort (tag) {
      if (_.matches({ tag })(this.sort)) {
        // If we're already on this tag, toggle off sort.
        this.sort = {}
      } else {
        this.sort = { tag }
      }
    },
    getActiveSortClass (tag) {
      if (_.matches({ tag })(this.sort)) {
        return 'btn-primary'
      } else {
        return 'btn-outline-primary'
      }
    }
  },
  components: {
    Game
  }
}
</script>
