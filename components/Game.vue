<template>
  <li class="list-group-item">
    <div class="row">
      <div class="col-md-1 col-12">
        <img v-if="iconUrl" class="img-thumbnail" :src="iconUrl" :alt="`Icon for ${game.name}`" />
      </div>
      <div class="col-md-8 col-12">
        <span class="game-text">{{ game.name }}</span>
      </div>
      <div class="col-md-3 col-12 text-md-right">
        <div class="tags">
          <div v-for="tag in tags" :key="tag.name" class="tag">
            <i :class="['fa', `fa-${tag.icon}`]" aria-hidden="true"></i>
            <span class="tag-text">{{ tag.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </li>
</template>

<script>
import steam from '~/assets/js/steam/client'
import _ from 'lodash'

export default {
  props: {
    game: {
      required: true,
      type: Object
    }
  },
  data () {
    return {
      tagIcons: {
        'Massively Multiplayer': 'globe',
        'Local Multiplayer': 'gamepad',
        'Multiplayer': 'sitemap',
        'Co-op': 'heart'
      }
    }
  },
  computed: {
    iconUrl () {
      return steam.getIconUrl(this.game)
    },
    tags () {
      return _(this.game.tags).map((tag) => {
        if (this.tagIcons[tag]) {
          return {
            icon: this.tagIcons[tag],
            name: tag
          }
        }
      }).compact().value()
    }
  }
}
</script>

<style>
.tags {
  display: inline-block;
  font-size: 80%;
}
.tag {
  padding-left: 5px;
  padding-top: 5px;
  display: inline-block;
}
.tag-text {
  padding-left: 0.25em;
}
</style>
