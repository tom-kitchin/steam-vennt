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
      <steam-profile-list v-model="steamProfiles" :canRemove="true" />
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
import _ from 'lodash'
import SteamProfileList from '~/components/SteamProfileList'

export default {
  data () {
    return {
      newSteamId: '',
      steamProfiles: []
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
      let providedId = this.newSteamId
      this.newSteamId = ''
      this.steamProfiles = [
        ...this.steamProfiles,
        {
          providedId,
          status: 'loading'
        }
      ]
    }
  },
  components: {
    SteamProfileList
  }
}
</script>
