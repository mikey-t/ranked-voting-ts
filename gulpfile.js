const rimraf = require('rimraf')
const { spawn } = require('child_process')
const { waitForProcess, defaultSpawnOptions } = require('@mikeyt23/node-cli-utils')
const { series } = require('gulp')

async function clean() {
  console.log('deleting dist and coverage directory contents...')
  await Promise.all([
    new Promise(resolve => rimraf('dist/**', resolve)),
    new Promise(resolve => rimraf('coverage/**', resolve))
  ])
}

async function tsc() {
  await waitForProcess(spawn('tsc', [], defaultSpawnOptions))
}

exports.clean = clean
exports.build = series(clean, tsc)
