var video;
const extractFrames = require('ffmpeg-extract-frames')
function extractframes( path){
    await extractFrames({
        input: 'media/1.mp4',
        output: './frame-%d.png',
        fps: 6
      })
}