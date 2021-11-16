const { series } = require('gulp')
const { spawn } = require('child_process')
const fs = require('fs')
const fse = require('fs-extra')
const rimraf = require('rimraf')
const { waitForProcess, defaultSpawnOptions } = require('@mikeyt23/node-cli-utils')
const util = require('util')
const path = require('path')
const readdir = util.promisify(fs.readdir)

async function clean() {
  console.log('deleting dist and coverage directory contents...')
  await Promise.all([
    new Promise(resolve => rimraf('dist/*', resolve)),
    new Promise(resolve => rimraf('coverage/*', resolve))
  ])
}

async function tsc() {
  await waitForProcess(spawn('npm run tsc', [], defaultSpawnOptions))
}

async function pack() {
  console.log('packing...')
  await fse.mkdirp('packed')
  await new Promise(resolve => rimraf('packed/*', resolve))
  
  await waitForProcess(spawn('npm pack', [], defaultSpawnOptions))
  const fileNames = await readdir('./')
  const tarballs = fileNames.filter(f => f.endsWith('.tgz'))
  console.log('tarballs: ', tarballs)
  
  if (tarballs.length == 0) {
    throw new Error('no tarball was created - cannot move to packed dir')
  }
  
  if (tarballs.length > 1) {
    throw new Error('multiple packed modules - delete them all and re-run')
  }
  
  console.log('moving tarball to packed dir')
  await fse.move(tarballs[0], path.join('packed', tarballs[0]))
}

exports.clean = clean
exports.build = series(clean, tsc)
exports.pack = series(clean, tsc, pack)
