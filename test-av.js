// test-av.js
import WebTorrent from 'webtorrent'
import SimpleParser from './simple-parser.js'
import { EventEmitter } from 'events'
import Debug from 'debug'

Debug.enable('test:*,torrent:parser')
const log = Debug('test:main')

const client = new WebTorrent()
const magnet = 'magnet:?xt=urn:btih:EB4EAIUOCL2CNDPUYPMGWTE42YPOJAZF&tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Fexodus.desync.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&dn=Solo%20Leveling%20S02E02%20I%20Suppose%20You%20Arent%20Aware%201080p%20CR%20WEB-DL%20AAC2.0%20H%20264-VARYG%20%28Ore%20dake%20Level%20Up%20na%20Ken%2C%20Multi-Subs%29';  // same as before
const targetFileIndex = 0

const bus = new EventEmitter()
let seenAudio = 0, seenVideo = 0

bus.on('subtitle-cue', ({ trackNumber, subtitle }) =>
  log(`SUB    track=${trackNumber}  t=${subtitle.time.toFixed(2)}  "${subtitle.text.slice(0,40)}"`))
bus.on('audio-packet', ({ trackNumber, pts, data }) => {
  if (++seenAudio <= 5) log(`AUDIO  track=${trackNumber}  pts=${pts.toFixed(3)}  size=${data.length}`)
})
bus.on('video-packet', ({ trackNumber, pts, isKeyframe, data }) => {
  if (++seenVideo <= 5) log(`VIDEO  track=${trackNumber}  pts=${pts.toFixed(3)}  key=${isKeyframe?'Y':'n'}  size=${data.length}`)
})

client.add(magnet, t => {
  const file = t.files[targetFileIndex]
  const parser = new SimpleParser(file, bus)
  parser.startParsingFromStream(file.createReadStream())
})
