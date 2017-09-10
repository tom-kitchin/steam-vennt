<template>
  <div>
    <div v-if="error" class="alert alert-danger" role="alert">ERROR: {{ error }}</div>
    <ul v-else class="list-group">
      <template v-for="(profile, profileKey) in value">
        <li class="list-group-item" :class="getClassForProfileStatus(profile.status)" :key="profileKey">
          <template v-if="profile.status === 'ready'">{{ profile.name }} ({{ profile.steamId }})</template>
          <template v-else-if="profile.status === 'error'">{{ profile.providedId }} - ERROR: {{ profile.error }}</template>
          <template v-else>{{ profile.providedId }} - loading...</template>
          <a
            v-if="canRemove"
            @click.prevent="removeProfile(profileKey)"
            class="btn btn-secondary btn-sm float-right"
            role="button"
            href="#"
          >Remove</a>
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
import { client as steam } from '~/assets/js/steam'
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
    }
  },
  data () {
    return {
      error: null
    }
  },
  methods: {
    getClassForProfileStatus (status) {
      switch (status) {
        case 'ready':
          return 'list-group-item-primary'
        case 'error':
          return 'list-group-item-warning'
        default:
          return 'list-group-item-secondary'
      }
    },
    removeProfile (profileKey) {
      this.$emit('input', _.omit(this.value, profileKey))
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
        let updatedProfiles = _.map(data, (profile) => {
          let originalProfile = this.findProfileByIdInValue(profile.providedId)
          if (profile.error) {
            return {
              ...profile,
              ...originalProfile,
              status: 'error'
            }
          }
          if (profile.visibility === 'private') {
            return {
              ...profile,
              ...originalProfile,
              status: 'error',
              error: `Profile for Steam ID ${originalProfile.providedId} is set to private`
            }
          }
          return {
            ...profile,
            ...originalProfile,
            status: 'ready'
          }
        })
        this.$emit('input', updatedProfiles)
      })
    },
    findProfileByIdInValue (profileId) {
      // ProfileID could be calculated steam ID or provided ID.
      let profile = _.find(this.value, _.matches({ steamId: profileId }))
      if (profile) { return profile }
      profile = _.find(this.value, _.matches({ providedId: profileId }))
      return profile
    }
  },
  watch: {
    value (newValue, oldValue) {
      if (!_.isEqual(_.keys(newValue), _.keys(oldValue))) {
        // Re-request profile data from the API when the value profiles change.
        this.loadProfiles()
      }
    }
  }
}
</script>
