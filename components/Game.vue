<template>
  <li class="list-group-item">
    <div class="row">
      <div class="col-md-1 col-12">
        <img v-if="game.iconUrl" class="img-thumbnail" :src="game.iconUrl" :alt="`Icon for ${game.name}`" />
      </div>
      <div class="col-md-7 col-12">
        <span class="game-text">{{ game.name }}</span>
      </div>
      <div class="col-md-4 col-12 text-md-right">
        <div v-for="tag in tags" :key="tag.name" class="tag">
          <i :class="['fa', `fa-${tag.icon}`]" aria-hidden="true"></i>
          <span class="tag-text">{{ tag.name }}</span>
        </div>
      </div>
    </div>
  </li>
</template>

<script>
import _ from 'lodash'

export default {
  props: {
    game: {
      required: true,
      type: Object
    },
    tagIcons: {
      required: false,
      type: Object,
      default () { return {} }
    }
  },
  computed: {
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
  font-size: 80%;
  color: #333333;
}
.tag-text {
  padding-left: 0.25em;
}
</style>
