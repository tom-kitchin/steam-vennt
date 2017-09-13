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
  data () {
    return {
      ready: false
    }
  },
  computed: {
    vennConfig () {
      return {
        datum: this.datum,
        callbacks: { onSegmentClicked: this.segmentSelected },
        trimVenn: this.trimVenn
      }
    },
    computedStyle () {
      if (!this.ready) {
        return {
          position: 'absolute',
          left: '-9000'
        }
      } else {
        return {
          position: 'initial'
        }
      }
    }
  },
  methods: {
    segmentSelected (sets) {
      this.$emit('segmentSelected', sets)
    },
    trimVenn (el) {
      let svg = el.querySelector('svg')
      svg.setAttribute('width', '100%')
      svg.setAttribute('height', '100%')
      let box = svg.getBBox() // get the visual boundary required to view all children
      if (box.width === 0) {
        // Annoyingly it might not have loaded, so loop until it has.
        return setTimeout(() => { this.trimVenn(el) }, 50)
      }
      let viewBox = [box.x, box.y, box.width, box.height].join(' ')
      // set viewable area based on value above
      svg.setAttribute('viewBox', viewBox)
    }
  },
  directives: {
    venn: {
      bind: function (el, { value: config }) {
        drawVenn(el, config.datum, config.callbacks)
        config.trimVenn(el)
      },
      update: function (el, { value: config }) {
        drawVenn(el, config.datum, config.callbacks)
        config.trimVenn(el)
      }
    }
  }
}
</script>
