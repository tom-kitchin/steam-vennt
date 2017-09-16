<template>
  <div>
    <div v-if="error" class="alert alert-danger" role="alert">ERROR: {{ error }}</div>
    <ul v-else class="list-group">
      <steam-profile
        v-for="profile in value"
        :key="profile.providedId"
        :profile="profile"
        :canRemove="canRemove"
        :canToggle="canToggle"
        :toggleState="profileToggles"
        :activeSteamIds="activeSteamIds"
        @updateToggleState="updateChecked"
        @remove="removeProfile(profile.providedId)"
        @addFriend="addProfile"
      />
    </ul>
  </div>
</template>

<script>
import SteamProfile from '~/components/SteamProfile'
import steam from '~/assets/js/steam/client'
import _ from 'lodash'

export default {
  props: {
    value: {
      required: true,
      type: Array
    },
    canRemove: {
      required: false,
      type: Boolean,
      default: false
    },
    canToggle: {
      required: false,
      type: Boolean,
      default: false
    },
    profileToggles: {
      required: false,
      type: Array,
      default () { return [] }
    }
  },
  data () {
    return {
      error: null
    }
  },
  computed: {
    activeSteamIds () {
      return _.map(this.value, (profile) => profile.steamId)
    }
  },
  methods: {
    addProfile (profile) {
      this.$emit('input', [
        ...this.value,
        profile
      ])
    },
    removeProfile (providedId) {
      this.$emit('input', _.reject(this.value, _.matches({ providedId })))
    },
    loadProfiles () {
      let steamIds = _.map(this.value, (profile) => {
        if (profile.steamId) { return profile.steamId }
        return profile.providedId
      })
      return steam.getSteamProfiles(steamIds).then(({ data }) => {
        if (data.error) {
          this.error = data.error
          // return
        } else {
          this.error = null
        }
        let updatedProfiles = _.map(this.value, (originalProfile) => {
          let newProfile = this.findProfileByIdInGroup(data, originalProfile.providedId)
          if (!newProfile) {
            // It was probably deleted in the meantime?
            return originalProfile
          }
          if (newProfile.error) {
            return {
              ...newProfile,
              ...originalProfile,
              status: 'error'
            }
          }
          if (newProfile.visibility === 'private') {
            return {
              ...newProfile,
              ...originalProfile,
              status: 'error',
              error: `Profile for Steam ID ${originalProfile.providedId} is set to private`
            }
          }
          return {
            ...newProfile,
            ...originalProfile,
            status: 'ready'
          }
        })
        this.$emit('input', updatedProfiles)
      }).catch((e) => {
        let data
        if (e.response) {
          data = e.response.data
        }

        if (_.isEmpty(data)) {
          this.error = `Failed to load data for profiles`
        } else if (data.error) {
          this.error = data.error
        } else {
          throw new Error(e)
        }
      })
    },
    findProfileByIdInGroup (group, profileId) {
      // ProfileID could be calculated steam ID or provided ID.
      let profile = _.find(group, _.matches({ steamId: profileId }))
      if (profile) { return profile }
      profile = _.find(group, _.matches({ providedId: profileId }))
      return profile
    },
    updateChecked (value) {
      this.$emit('updateChecked', value)
    }
  },
  watch: {
    value (newValue) {
      if (_.some(newValue, _.matches({ status: 'loading' }))) {
        // Re-request profile data from the API when there are new profiles which need loading.
        this.loadProfiles()
      }
    }
  },
  mounted () {
    if (this.value.length > 0) {
      this.loadProfiles()
    }
  },
  components: {
    SteamProfile
  }
}
</script>
