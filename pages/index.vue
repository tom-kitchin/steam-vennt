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
      <ul class="list-group">
        <template v-for="profile in steamProfiles">
          <li class="list-group-item" :class="getClassForProfileStatus(profile.status)">
            <template v-if="profile.status === 'ready'">{{ profile.name }} ({{ profile.steamId }})</template>
            <template v-else-if="profile.status === 'error'">{{ profile.steamId }} - ERROR: {{ profile.error }}</template>
            <template v-else>{{ profile.steamId }} - loading...</template>
            <a class="btn btn-secondary btn-sm float-right" role="button" @click.prevent="removeSteamId(profile.steamId)" href="#">Remove</a>
          </li>
        </template>
      </ul>
      <hr>
      <div class="form-row">
        <div class="form-group col-auto">
          <label for="steamId" class="sr-only">Steam ID</label>
          <input id="steamId" v-model="newSteamId" @keyup.enter="addSteamId" placeholder="Add Steam ID" />
        </div>
        <div class="form-group col-auto">
          <label for="addSteamId" class="sr-only">Add Steam ID</label>
          <a id="addSteamId" class="btn btn-primary btn-sm" role="button" @click.prevent="addSteamId" href="#">Add</a>
        </div>
      </div>
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
        account or the custom URL you can set in your Steam profile settings,
        <em>not</em> your profile or account name.
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
        Note that <strong>Vennt can't read private profiles!</strong>
      </p>
    </div>
  </section>
</template>

<script>
import { client as steam } from '~/assets/js/steam'
import _ from 'lodash'

export default {
  data () {
    return {
      newSteamId: '',
      steamProfiles: {}
    }
  },
  computed: {
    vennUrl () {
      let idString = _(this.readyProfiles).map((profile) => profile.steamId).join('+')
      return `/venn/${idString}`
    },
    readyProfiles () {
      return _.filter(this.steamProfiles, _.matches({ status: 'ready' }))
    },
    allowVennt () {
      return (this.readyProfiles.length > 0)
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
      let steamId = this.newSteamId
      this.newSteamId = ''
      this.steamProfiles = {
        ...this.steamProfiles,
        [steamId]: {
          steamId: steamId,
          status: 'loading'
        }
      }
      this.loadProfile(steamId)
    },
    removeSteamId (steamId) {
      this.steamProfiles = _.omit(this.steamProfiles, steamId)
    },
    loadProfile (steamId) {
      return steam.getSteamProfile(steamId).then(({ data }) => {
        if (data.error) {
          this.steamProfiles[steamId] = {
            steamId,
            status: 'error',
            error: data.error
          }
        } else if (data.visibility === 'private') {
          this.steamProfiles[steamId] = {
            steamId,
            status: 'error',
            name: data.personaname,
            error: `Profile for Steam ID ${steamId} is set to private`
          }
        } else {
          this.steamProfiles[steamId] = {
            steamId,
            name: data.personaname,
            status: 'ready'
          }
        }
      })
    },
    getClassForProfileStatus (status) {
      switch (status) {
        case 'ready':
          return 'list-group-item-primary'
        case 'error':
          return 'list-group-item-warning'
        default:
          return 'list-group-item-secondary'
      }
    }
  }
}
</script>
