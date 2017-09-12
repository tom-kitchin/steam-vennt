<template>
  <div>
    <div v-show="!loading">
      <multiselect
        :options="filteredFriendList"
        :searchable="true"
        :resetAfter="true"
        :option-height="66"
        @select="addFromFriendList"
        track-by="steamId"
        label="name"
        placeholder="Add your friends!"
      >
        <template slot="option" scope="props">
          <img
            v-if="props.option.avatar"
            class="img-thumbnail"
            :src="props.option.avatar"
            :alt="`Profile image for steam ID ${props.option.name}`"
          />
          <span class="profile-text">{{ props.option.name }}</span>
          <span v-if="props.option.visibility !== 'public'"> - this profile is private</span>
        </template>
      </multiselect>
    </div>
    <div v-show="loading" class="alert alert-secondary">
      Getting your friend list..
    </div>
  </div>
</template>

<script>
import { client as steam } from '~/assets/js/steam'
import _ from 'lodash'

let Multiselect
if (process.browser) {
  Multiselect = require('vue-multiselect').default
}

export default {
  props: {
    steamId: {
      required: true,
      type: String
    },
    activeSteamIds: {
      required: false,
      type: Array,
      default () { return [] }
    }
  },
  data () {
    return {
      friendList: [],
      loading: false
    }
  },
  computed: {
    hasFriends () {
      return !_.isEmpty(this.friendList)
    },
    filteredFriendList () {
      return _(this.friendList).reject((friend) => {
        return _.includes(this.activeSteamIds, friend.steamId)
      }).map((friend) => {
        if (friend.visibility === 'private') {
          return {
            ...friend,
            $isDisabled: true
          }
        }
        return friend
      }).sortBy((friend) => friend.name).value()
    }
  },
  methods: {
    loadFriendList () {
      this.loading = true
      return steam.getSteamFriendList(this.steamId).then(({ data }) => {
        this.friendList = data
        this.loading = false
      })
    },
    addFromFriendList (friend) {
      this.$emit('addFriend', {
        ...friend,
        status: 'ready'
      })
    }
  },
  components: {
    Multiselect
  },
  mounted () {
    this.loadFriendList()
  },
  watch: {
    steamId (newSteamId, oldSteamId) {
      if (newSteamId !== oldSteamId) {
        this.loadFriendList()
      }
    }
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
