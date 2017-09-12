<template>
  <div v-if="hasFriends">
    <ul class="list-inline">
      <li
        v-for="friend in filteredFriendList"
        :key="friend.steamId"
        class="list-inline-item"
      >
        <a
          v-if="friend.visibility === 'public'"
          class="btn btn-success"
          href="#"
          role="button"
          @click.prevent="addFromFriendList(friend)"
        >{{ friend.name }}</a>
        <a
          v-else
          class="btn btn-success disabled"
          href="#"
          role="button"
          @click.prevent
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
      required: false,
      type: Array,
      default: []
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
    },
    filteredFriendList () {
      return _.reject(this.friendList, (friend) => {
        return _.includes(this.activeSteamIds, friend.steamId)
      })
    }
  },
  methods: {
    loadFriendList () {
      if (!this.hasFriends) {
        steam.getSteamFriendList(this.steamId).then(({ data }) => {
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
