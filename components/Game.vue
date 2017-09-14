<template>
  <tr>
    <td><img :src="iconUrl" /></td>
    <td>{{ game.name }}</td>
  </tr>
</template>

<script>
import steam from '~/assets/js/steam/client'

export default {
  props: {
    game: {
      required: true,
      type: Object
    }
  },
  computed: {
    iconUrl () {
      return steam.getIconUrl(this.game)
    }
  }
}
</script>
