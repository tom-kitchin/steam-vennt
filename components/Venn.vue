<template>
  <div class="venn" v-venn="vennConfig"></div>
</template>

<script>
import drawVenn from '~/assets/js/draw-venn.js'

export default {
  props: {
    datum: {
      required: true,
      type: Array
    }
  },
  computed: {
    vennConfig () {
      return {
        datum: this.datum,
        callbacks: { onSegmentClicked: this.segmentSelected }
      }
    }
  },
  methods: {
    segmentSelected (sets) {
      this.$emit('segmentSelected', sets)
    }
  },
  directives: {
    venn: {
      bind: function (el, { value: config }) {
        drawVenn(el, config.datum, config.callbacks)
      },
      update: function (el, { value: config }) {
        drawVenn(el, config.datum, config.callbacks)
      }
    }
  }
}
</script>
