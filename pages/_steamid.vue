<script>
import Root from '~/pages/index'

export default {
  extends: Root,
  data () {
    return {
      mainProfile: {
        providedId: this.$route.params.steamid,
        status: 'loading'
      }
    }
  },
  mounted () {
    this.loadMainProfile()
  }
}
</script>
