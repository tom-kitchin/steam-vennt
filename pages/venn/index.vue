<template>
  <section class="container">
    <h2>Enter the steam IDs you want to use</h2>
    <ul>
      <li v-for="id in steamIds">{{ id }}</li>
      <li><input v-model="newSteamId" placeholder="Steam ID" /><a @click="addSteamId">+</a></li>
    </ul>
    <p v-show="showGoLink"><a :href="vennUrl">Go Go Venn!</a></p>
  </section>
</template>

<script>
import _ from 'lodash'

export default {
  data () {
    return {
      newSteamId: '',
      steamIds: []
    }
  },
  computed: {
    vennUrl () {
      let idString = _.join(this.steamIds, '+')
      return `/venn/${idString}`
    },
    showGoLink () {
      return (this.steamIds.length > 0)
    }
  },
  methods: {
    addSteamId () {
      this.steamIds = [
        ...this.steamIds,
        this.newSteamId
      ]
      this.newSteamId = ''
    }
  }
}
</script>
