<template>
  <section class="container">
    <div class="intro">
      <p class="lead">
        Compare the games owned by any number of Steam accounts to find out what games you all have in common.
      </p>
      <p>
        Sudden extra member of the group for game night and you need to find something everyone can play?
        Enter your account ID below to quickly compare you and your friends' libraries.
      </p>
    </div>
    <div>
      <div v-show="hasMainProfile">
        <steam-profile
          :profile="mainProfile"
          :canRemove="true"
          @remove="clearMainProfile"
        />
      </div>
      <transition>
        <div v-show="!hasMainProfile">
          <p class="instruction">
            First, enter your steam ID:
          </p>
          <div class="form-row">
            <div class="form-group col-auto">
              <label for="steamId" class="sr-only">Steam ID</label>
              <input id="steamId" v-model="newSteamId" @keyup.enter="setMainProfile" placeholder="Enter your Steam ID" />
            </div>
            <div class="form-group col-auto">
              <label for="addSteamId" class="sr-only">Continue</label>
              <a
                id="addSteamId"
                class="btn btn-primary btn-sm"
                :class="{ disabled: !newSteamId }"
                role="button"
                @click.prevent="setMainProfile"
                href="#"
              ><i class="fa fa-check" aria-hidden="true"></i> Continue</a>
            </div>
          </div>
          <div>
            <form action="/api/openid/steam" method="post" class="form-row">
              <div class="form-group col-auto">
                <label for="moreSteamIds">Or sign in through Steam:</label>
                <button id="moreSteamIds" type="submit" class="btn btn-outline-light" value="Sign In">
                  <img :src="require('~/assets/images/signinthroughsteam.png')" alt="Sign in with steam" />
                </button>
              </div>
            </form>
          </div>
          <div class="alert alert-secondary">
            <p>
              Your Steam ID should be either the unique numeric ID Steam assigns to your
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
        </div>
      </transition>
      <transition>
        <div v-show="mainProfileReady">
          <hr>
          <p :class="{ instruction: !hasReadyFriends }">
            Now add the Steam friends you'd like to compare with:
          </p>
          <steam-profile-friends
            v-if="mainProfileReady"
            :steamId="mainProfile.steamId"
            :activeSteamIds="activeSteamIds"
            @addFriend="addFriend"
          />
          <div>
            <div class="form-row mt-3">
              <div class="form-group col-auto">
                <label for="moreSteamIds" class="mr-2">Or enter more Steam IDs by hand:</label>
                <input id="moreSteamIds" v-model="extraSteamId" @keyup.enter="addFriendId" placeholder="Steam ID" />
              </div>
              <div class="form-group col-auto">
                <label for="addSteamId" class="sr-only">Add</label>
                <a
                  id="addSteamId"
                  class="btn btn-primary btn-sm"
                  :class="{ disabled: !extraSteamId }"
                  role="button"
                  @click.prevent="addFriendId"
                  href="#"
                ><i class="fa fa-plus" aria-hidden="true"></i> Add</a>
              </div>
            </div>
          </div>
          <steam-profile-list
            v-model="friendProfiles"
            :canRemove="true"
          />
        </div>
      </transition>
      <transition>
        <div v-show="hasReadyFriends">
          <hr>
          <p class="instruction">
            All ready? Then hit the button!
          </p>
          <a
            :href="vennUrl"
            class="btn btn-primary"
            :class="venntButtonClass"
            :aria-disabled="venntButtonAriaDisabled"
            role="button"
          >Go Go Vennt!</a>
        </div>
      </transition>
    </div>

  </section>
</template>

<script>
import _ from 'lodash'
import steam from '~/assets/js/steam/client'
import SteamProfile from '~/components/SteamProfile'
import SteamProfileList from '~/components/SteamProfileList'
import SteamProfileFriends from '~/components/SteamProfileFriends'

export default {
  data () {
    return {
      mainProfile: {},
      newSteamId: '',
      extraSteamId: '',
      friendProfiles: []
    }
  },
  computed: {
    hasMainProfile () {
      return !_.isEmpty(this.mainProfile)
    },
    mainProfileReady () {
      return this.mainProfile.status === 'ready'
    },
    hasReadyFriends () {
      return _.some(this.friendProfiles, _.matches({ status: 'ready' }))
    },
    vennUrl () {
      if (this.mainProfileReady && this.hasReadyFriends) {
        let idString = _(this.readyProfiles).map((profile) => profile.steamId).join('+')
        return `/venn/${this.mainProfile.steamId}+${idString}`
      } else {
        return ''
      }
    },
    readyProfiles () {
      return _.filter(this.friendProfiles, _.matches({ status: 'ready' }))
    },
    activeSteamIds () {
      return _.map(this.friendProfiles, (profile) => profile.steamId)
    },
    venntButtonClass () {
      return {
        disabled: !this.hasReadyFriends
      }
    },
    venntButtonAriaDisabled () {
      if (this.hasReadyFriends) {
        return 'false'
      } else {
        return 'true'
      }
    }
  },
  methods: {
    setMainProfile () {
      if (this.newSteamId) {
        let providedId = this.newSteamId
        this.newSteamId = ''
        this.mainProfile = {
          providedId,
          status: 'loading'
        }
        this.loadMainProfile()
      }
    },
    loadMainProfile () {
      return steam.getSteamProfiles([this.mainProfile.providedId]).then(({ data }) => {
        let error
        if (_.isEmpty(data)) { error = `Failed to load data for profile ${this.mainProfile.providedId}` }
        if (data.error) { error = data.error }

        if (error) {
          this.mainProfile = {
            ...this.mainProfile,
            status: 'error',
            error: error
          }
          return
        }

        let newProfile = data[0]
        if (_.isEmpty(newProfile)) { error = `Failed to load data for profile ${this.mainProfile.providedId}` }
        if (newProfile.error) { error = newProfile.error }
        if (newProfile.visibility !== 'public') { error = `Profile for Steam ID ${this.mainProfile.providedId} is set to private` }

        if (error) {
          this.mainProfile = {
            ...newProfile,
            ...this.mainProfile,
            status: 'error',
            error: error
          }
          return
        }

        this.mainProfile = {
          ...newProfile,
          ...this.mainProfile,
          status: 'ready'
        }
      }).catch((e) => {
        let data
        if (e.response) {
          data = e.response.data
        }

        let profileError
        if (_.isEmpty(data)) { profileError = `Failed to load data for profile ${this.mainProfile.providedId}` }
        if (data.error) { profileError = data.error }

        if (profileError) {
          this.mainProfile = {
            ...this.mainProfile,
            status: 'error',
            error: profileError
          }
          return
        }

        throw new Error(e)
      })
    },
    clearMainProfile () {
      this.mainProfile = {}
      this.friendProfiles = []
    },
    addFriend (friend) {
      this.friendProfiles = [
        ...this.friendProfiles,
        friend
      ]
    },
    addFriendId () {
      if (this.extraSteamId) {
        this.friendProfiles = [
          ...this.friendProfiles,
          {
            providedId: this.extraSteamId,
            status: 'loading'
          }
        ]
        this.extraSteamId = ''
      }
    }
  },
  components: {
    SteamProfile,
    SteamProfileList,
    SteamProfileFriends
  }
}
</script>

<style>
.instruction {
  font-weight: bold;
}

.v-enter-active, .v-leave-active {
  transition: opacity 0.5s
}
.v-enter, .v-leave-to {
  opacity: 0
}
</style>
