// Get all possible subsets of an array.
export default function * subsets (array, offset = 0) {
  while (offset < array.length) {
    let first = array[offset++]
    for (let subset of subsets(array, offset)) {
      subset.push(first)
      yield subset
    }
  }
  yield []
}
