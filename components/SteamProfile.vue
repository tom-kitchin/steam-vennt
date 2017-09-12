<template>
  <li class="list-group-item" :class="statusClass">
    <img v-if="profile.avatar" class="img-thumbnail" :src="profile.avatar" :alt="`Profile image for steam ID ${profile.providedId}`" />
    <span class="profile-text">
      <template v-if="profile.status === 'ready'">{{ displayName }}</template>
      <template v-else-if="profile.status === 'error'">{{ displayName }} - ERROR: {{ profile.error }}</template>
      <template v-else>{{ displayName }} - loading...</template>
    </span>
    <div v-if="profile.status === 'ready' && canToggle" class="float-right">
      <input
        v-model="checked"
        type="checkbox"
        class="tgl tgl-flat"
        :id="`profileCheck-${profile.steamId}`"
      />
      <label :for="`profileCheck-${profile.steamId}`" class="tgl-btn"></label>
    </div>
    <div v-if="canChange" class="float-right">
      <a
        v-if="profile.visibility === 'public'"
        @click.prevent="showFriends"
        class="btn btn-primary btn-sm"
        role="button"
        href="#"
      >Show friends</a>
      <a
        @click.prevent="$emit('remove')"
        class="btn btn-secondary btn-sm"
        role="button"
        href="#"
      >Remove</a>
    </div>
    <template v-if="isShowingFriends">
      <hr>
      <steam-profile-friends
        :steamId="profile.steamId"
        :activeSteamIds="activeSteamIds"
        @addFriend="addFriend"
      />
    </template>
  </li>
</template>

<script>
import SteamProfileFriends from '~/components/SteamProfileFriends'
import _ from 'lodash'

export default {
  props: {
    profile: {
      required: true,
      type: Object
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
    toggleState: {
      required: false,
      type: Array,
      default: []
    },
    activeSteamIds: {
      required: false,
      type: Array,
      default: []
    }
  },
  data () {
    return {
      isShowingFriends: false
    }
  },
  computed: {
    displayName () {
      if (this.profile.name) {
        return `${this.profile.name} (${this.profile.providedId})`
      } else {
        return this.profile.providedId
      }
    },
    statusClass () {
      switch (this.profile.status) {
        case 'ready':
          return 'list-group-item-primary'
        case 'error':
          return 'list-group-item-warning'
        default:
          return 'list-group-item-secondary'
      }
    },
    checked: {
      get () {
        return _.includes(this.toggleState, this.profile.steamId)
      },
      set (value) {
        if (value) {
          this.$emit('updateToggleState', [
            ...this.toggleState,
            this.profile.steamId
          ])
        } else {
          this.$emit('updateToggleState', _.reject(this.toggleState, this.profile.steamId))
        }
      }
    }
  },
  methods: {
    showFriends () {
      this.isShowingFriends = true
    },
    addFriend (friend) {
      this.$emit('addFriend', friend)
    }
  },
  components: {
    SteamProfileFriends
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
