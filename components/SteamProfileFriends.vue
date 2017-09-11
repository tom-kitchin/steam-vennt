<template>
  <div v-if="hasFriends">
    <ul class="list-inline">
      <li
        v-for="friend in friendList"
        :key="friend.steamId"
        class="list-inline-item"
      >
        <a
          class="btn btn-success"
          href="#"
          role="button"
          @click="addFromFriendList(friend)"
        >{{ friend.name }}</a>
      </li>
    </ul>
  </div>
</template>

<script>
import { client as steam } from '~/assets/js/steam'
import _ from 'lodash'

export default {
  props: {
    steamId: {
      required: true,
      type: String
    },
    activeSteamIds: {
      required: true,
      type: Array
    }
  },
  data () {
    return {
      friendList: []
    }
  },
  computed: {
    hasFriends () {
      return !_.isEmpty(this.friendList)
    }
  },
  methods: {
    loadFriendList (steamId) {
      if (!this.hasFriends)) {
        steam.getSteamFriendList(steamId).then(({ data }) => {
          this.friendList = data
        })
      }
    },
    addFromFriendList (friend) {
      this.$emit('addFriend', {
        ...friend,
        status: 'ready'
      })
    }
  },
  mounted () {
    this.loadFriendList()
  }
}
</script>
