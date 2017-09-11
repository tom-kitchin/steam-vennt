<template>
  <div>
    <div v-if="error" class="alert alert-danger" role="alert">ERROR: {{ error }}</div>
    <ul v-else class="list-group">
      <template v-for="profile in value">
        <li class="list-group-item" :class="getClassForProfileStatus(profile.status)" :key="profile.providedId">
          <img v-if="profile.avatar" class="img-thumbnail" :src="profile.avatar" :alt="`Profile image for steam ID ${profile.providedId}`" />
          <span class="profile-text">
            <template v-if="profile.status === 'ready'">{{ getProfileDisplayName(profile) }}</template>
            <template v-else-if="profile.status === 'error'">{{ getProfileDisplayName(profile) }} - ERROR: {{ profile.error }}</template>
            <template v-else>{{ getProfileDisplayName(profile) }} - loading...</template>
          </span>
          <div v-if="profile.status === 'ready' && canToggle" class="float-right">
            <input
              v-model="checkedProfiles"
              type="checkbox"
              class="tgl tgl-flat"
              :id="`profileCheck-${profile.steamId}`"
              :value="profile.steamId"
            />
            <label :for="`profileCheck-${profile.steamId}`" class="tgl-btn"></label>
          </div>
          <div v-if="canChange" class="float-right">
            <a
              v-if="profile.visibility === 'public'"
              @click.prevent="showFriendList(profile.steamId)"
              class="btn btn-primary btn-sm"
              role="button"
              href="#"
            >Show friends</a>
            <a
              @click.prevent="removeProfile(profile.providedId)"
              class="btn btn-secondary btn-sm"
              role="button"
              href="#"
            >Remove</a>
          </div>
          <template v-if="hasFriends(profile.steamId)">
            <hr>
            <ul class="list-inline">
              <li
                v-for="friend in friendLists[profile.steamId]"
                :key="friend.steamId"
                class="list-inline-item"
              ><a class="btn btn-success" href="#" role="button">{{ friend.name }}</a></li>
            </ul>
          </template>
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
    profileState: {
      required: false,
      type: Array,
      default () { return [] }
    }
  },
  data () {
    return {
      error: null,
      friendLists: {}
    }
  },
  computed: {
    checkedProfiles: {
      get () {
        return this.profileState
      },
      set (value) {
        this.$emit('updateChecked', value)
      }
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
    getProfileDisplayName (profile) {
      if (profile.name) {
        return `${profile.name} (${profile.providedId})`
      } else {
        return profile.providedId
      }
    },
    showFriendList (steamId) {
      if (_.isEmpty(this.friendLists[steamId])) {
        steam.getSteamFriendList(steamId).then(({ data }) => {
          this.friendLists = {
            ...this.friendLists,
            [steamId]: data
          }
        })
      }
    },
    addFromFriendList (steamId) {
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
    hasFriends (steamId) {
      return !_.isEmpty(this.friendLists[steamId])
    }
  },
  watch: {
    value (newValue, oldValue) {
      if (!_.isEqual(_.keys(newValue), _.keys(oldValue))) {
        // Re-request profile data from the API when the value profiles change.
        this.loadProfiles()
      }
    }
  },
  created () {
    if (this.value.length > 0) {
      this.loadProfiles()
    }
  }
}
</script>

<style lang="scss">
.profile-text {
  padding-left: 1em;
}

.tgl {
  display: none;

  // add default box-sizing for this scope
  &,
  &:after,
  &:before,
  & *,
  & *:after,
  & *:before,
  & + .tgl-btn {
    box-sizing: border-box;
    &::selection {
      background: none;
    }
  }

  + .tgl-btn {
    outline: 0;
    display: block;
    width: 4em;
    height: 2em;
    position: relative;
    cursor: pointer;
    user-select: none;
    &:after,
    &:before {
      position: relative;
      display: block;
      content: "";
      width: 50%;
      height: 100%;
    }

    &:after {
      left: 0;
    }

    &:before {
      display: none;
    }
  }

  &:checked + .tgl-btn:after {
    left: 50%;
  }
}

.tgl-flat {
  + .tgl-btn {
    padding: 2px;
    transition: all .2s ease;
    background: #fff;
    border: 4px solid #f2f2f2;
    border-radius: 2em;
    &:after {
      transition: all .2s ease;
      background: #f2f2f2;
      content: "";
      border-radius: 1em;
    }
  }

  &:checked + .tgl-btn {
    border: 4px solid #7FC6A6;
    &:after {
      left: 50%;
      background: #7FC6A6;
    }
  }
}
</style>
