module.exports = {
  webpack: (config, options, webpack) => {
    config.entry.main = ['./server/index.js']
    config.resolve.alias = {
      '~': __dirname
    }
    return config
  }
}
