<template>
  <section class="container">
    <div class="intro">
      <p class="lead">
        Compare the games owned by any number of Steam accounts to find out what games you all have in common.
      </p>
      <p>
        Sudden extra member of the group for game night and you need to find something everyone can play?
        Enter your account IDs below to quickly compare all of your libraries.
      </p>
    </div>
    <div>
      <h3>Steam IDs to Vennt</h3>
      <table class="table">
        <tbody>
          <tr v-for="(id, index) in steamIds">
            <td>{{ id }}</td>
            <td><a class="btn btn-secondary btn-sm" role="button" @click.prevent="removeSteamId(index)" href="#">Remove</a></td>
          </tr>
          <tr class="form-inline">
            <td><input v-model="newSteamId" @keyup.enter="addSteamId" placeholder="Add Steam ID" /></td>
            <td><a class="btn btn-primary btn-sm" role="button" @click.prevent="addSteamId" href="#">Add</a></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mb-3">
      <a
        :href="vennUrl"
        class="btn btn-primary"
        :class="venntButtonClass"
        :aria-disabled="venntButtonAriaDisabled"
        role="button"
      >Go Go Vennt!</a>
    </div>

    <div class="alert alert-secondary">
      <p>
        These IDs should be either the unique numeric ID Steam assigns to your
        account or the custom URL you can set in your Steam profile settings.
      </p>
      <p>
        You can find it by going to your Steam profile in your browser and looking
        in the address bar for the following:
      </p>
      <figure class="figure">
        <img :src="require('~/assets/images/steam-id-example.png')" class="figure-img img-fluid" alt="Picture of the Steam ID section of a URL" />
        <figcaption class="figure-caption text-right">Here my Steam ID is 'twodaemon'</figcaption>
      </figure>
      <p>
        Note that Vennt can't read private profiles!
      </p>
    </div>
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
    allowVennt () {
      return (this.steamIds.length > 0)
    },
    venntButtonClass () {
      return {
        disabled: !this.allowVennt
      }
    },
    venntButtonAriaDisabled () {
      if (this.allowVennt) {
        return 'false'
      } else {
        return 'true'
      }
    }
  },
  methods: {
    addSteamId () {
      this.steamIds = [
        ...this.steamIds,
        this.newSteamId
      ]
      this.newSteamId = ''
    },
    removeSteamId (index) {
      console.log(index)
      this.steamIds = [
        ..._.slice(this.steamIds, 0, index),
        ..._.slice(this.steamIds, index + 1)
      ]
    }
  }
}
</script>
