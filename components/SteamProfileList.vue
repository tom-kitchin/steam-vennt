<template>
  <div>
    <div v-if="error" class="alert alert-danger" role="alert">ERROR: {{ error }}</div>
    <ul v-else class="list-group">
      <steam-profile
        v-for="profile in value"
        :key="profile.providedId"
        :profile="profile"
        :canChange="canChange"
        :canToggle="canToggle"
        :toggleState="profileToggles"
        @updateToggleState="updateChecked"
        @remove="removeProfile(profile.providedId)"
        @addFriend="addProfile"
      />
    </ul>
  </div>
</template>

<script>
import SteamProfile from '~/components/SteamProfile'
import { client as steam } from '~/assets/js/steam'
import _ from 'lodash'

export default {
  props: {
    value: {
      required: true,
      type: Array
    },
    canChange: {
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
    value (newValue, oldValue) {
      if (_.difference(_.keys(newValue), _.keys(oldValue)).length > 0) {
        // Re-request profile data from the API when the value profiles change.
        this.loadProfiles()
      }
    }
  },
  created () {
    if (this.value.length > 0) {
      this.loadProfiles()
    }
  },
  components: {
    SteamProfile
  }
}
</script>
