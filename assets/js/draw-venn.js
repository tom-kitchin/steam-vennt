let venn = require('venn.js')
let d3 = require('d3')

export default function (el, datum, callbacks) {
  let chart = venn.VennDiagram()
  let d3el = d3.select(el)
  d3el.datum(datum).call(chart)

  let allGroups = d3el.selectAll('g')

  // Set the outline of all groups but hide it.
  allGroups.select('path')
    .style('stroke', 'black')
    .style('stroke-width', 3)
    .style('stroke-opacity', 0)

  // add listeners to all the groups to display tooltip on mouseover
  allGroups.on('mouseover', function (d, i) {
    // sort all the areas relative to the current item
    venn.sortAreas(d3el, d)

    // highlight the current path
    var selection = d3.select(this)
    selection.select('path')
      // .style('stroke-width', 3)
      .style('fill-opacity', d.sets.length === 1 ? 0.4 : 0.1)
      // .style('stroke-opacity', 1)
  })

  allGroups.on('mouseout', function (d, i) {
    var selection = d3.select(this)
    selection.select('path')
      // .style('stroke-width', 0)
      .style('fill-opacity', d.sets.length === 1 ? 0.25 : 0.0)
      // .style('stroke-opacity', 0)
  })

  allGroups.on('click', function (d, i) {
    // Hide all groups again in case we'd previously selected something.
    allGroups.select('path')
      .style('stroke-opacity', 0)
    // Show the outline of the selected group.
    var selection = d3.select(this)
    selection.select('path')
      .style('stroke-opacity', 1)

    if (callbacks.onSegmentClicked) {
      callbacks.onSegmentClicked(d.sets)
    }
  })
}
