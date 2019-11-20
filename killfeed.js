import { Volume } from 'memfs';
import { finished } from 'stream';
import Tesseract from 'tesseract.js';

const ffmpeg = require('fluent-ffmpeg');
const Jimp = require('jimp');
const cv = require('opencv4nodejs');
const NodeCache = require("node-cache");
const myArgs = process.argv.slice(2);
const duration;
const vol = new Volume();
var frames = [];
const cropKillfeedPOV = [];
const cropKillfeedSpectator = [];
const cropKillfeedDimensions = [];
const cropUltsSpectator = 160;
const killArrows = [await cv.imreadAsync('./resources/arrows/normal.png'), await cv.imreadAsync('./resources/arrows/ult.png')];
const colors = [FFFFFF, 0x240AFE];
const heroIcons = [];
const heroes = ['DVa', 'Orisa', 'Roadhog', 'Hammond',       //hero list, organized by role, broken into 2 blocks, heroes who can headshot first, can't second
  'Ashe', 'Bastion', 'Doomfist', 'Genji', 'Hanzo', 'McCree',
  'Mei', 'Reaper', 'Soldier: 76', 'Sombra', 'Torbjorn',
  'Tracer', 'Widowmaker', 'Baptiste', 'Lucio', 'Mercy',
  'Zenyatta', 'Reinhardt', 'Sigma', 'Winston', 'Zarya',
  'Junkrat', 'Pharah', 'Symmetra', 'Ana', 'Brigitte', 'Moira'];
const killingUlts = ['Roadhog', 'Hanzo', 'DVa', 'Hammond',  //heroes who's ults can kill
  'Ashe', 'Bastion', 'Doomfist', 'Genji', 'McCree',
  'Mei', 'Reaper', 'Soldier: 76', 'Torbjorn',
  'Tracer', 'Reinhardt', 'Sigma', 'Winston', 'Zarya',
  'Junkrat', 'Pharah', 'Moira'];
const canHeadshotNormal = 21;
const canHeadshotUlt = 2;
const killCache = new NodeCache(stdTTL = 15, useClones = false);
function extractframes(path) {
  ffmpeg.ffprobe(videoFile, (error, metadata) => {
    duration = metadata.format.duration;
  });
  vol.mkdir("./frames");
  for (let index = 0; index < array.length; index++) {
    cv.imreadAsync('./resources/' + element + '/' + element + '_icon.png', (err, mat) => {
      heroIcons[index] = mat;
    })
  }



  await extractFrames({

  })
}
async function extractFrame(path, framenumber) {
  var ffstream = ffmpeg(path)
    .setStartTime((framenumber % 10) + (60 * (framenumber - framenumber % 10)))
    .frames(1)
    .format("png")
    .stream(frame.stream)
    .withInputOption("-i")
    .pipe();
  var data = [];
  ffstream.on('data', function (chunk) {
    this.data.push(chunk);
  });
  ffstream.on('finished', function () {
    var frame = Buffer.concat(array);
  });

  cropFrame(myArgs[0], frame, framenumber).then(checkKillfeedArrows(framenumber));
}

async function cropFrame(isSpectator, buffer, framenumber) {
  var crop = [];
  vol.mkdir("./frames/frame_" + framenumber);
  if (isSpectator == true) {
    crop = cropSpectator;
  }
  else {
    crop = cropPOV;
  }
  Jimp.read(buffer)
    .then(image => {
      if (isSpectator == true) {
        var ults = image.clone();
        ults.crop(0, 0, 1920, cropUltsSpectator)
        var file = './frames/frame_' + framenumber + '_ults' + image.getExtension();
        var promise = killfeed[i].getBufferAsync(Jimp.MIME_PNG);
        promise.then(function (result) {
          vol.writeFileAsync(file, result)
        });
      }
      image.crop(crop[0], crop[1], crop[0] + cropKillfeedDimensions[0], crop[1] + cropKillfeedDimensions[1]);
      var killfeed = [];
      for (let index = 0; index < 6; index++) {
        killfeed[i] = image.clone().crop(crop[0], crop[1] + Math.floor(i * cropKillfeedDimensions[1] / 6), cropKillfeedDimensions[0], Math.floor(i * cropKillfeedDimensions[1] / 6));
        var file = './frames/frame_' + framenumber + '_killfeed_' + i + image.getExtension();
        var promise = killfeed[i].getBufferAsync(Jimp.MIME_PNG);
        promise.then(function (result) {
          vol.writeFileAsync(file, result)
        });
      }
    })
    .catch(err => {
      throw err;
    });
}
async function checkKillfeedArrows(framenumber) {
  var killfeedFrames = [];
  var frameText = new String[6];
  var isHeadshot = false;
  var isUlt = false;
  for (let index = 0; index < 6; index++) {
    vol.readFile('./frames/frame_' + framenumber + '_killfeed_' + i + image.getExtension(), (err, data) => {
      if (err) throw err;
      killfeedFrames[index] = data;
      const imageMatrix = new cv.Mat(data, 1080, 1920, cv.CV_8UC3);
      killArrows.forEach(element => {
        const matched = imageMatrix.matchTemplate(element, 5);
        const point = matched.minMaxLoc();
        if (point[1] > 0.8) {
          if (element == killArrows[0]) {
            isUlt = false;
          }
          else {
            isUlt = true;
          }
          if (imageMatrix[point[2], point[3]] == colors[1]) {
            isHeadshot = true;
          }
          else {
            isHeadshot = false;
          }
        }
      });
    });
    frameText[index] = await runOCR(killfeedFrames[i], point, isHeadshot, isUlt);
    var heroesInKill = await getHeroes(killfeedFrames[i], point, isHeadshot, isUlt);
    frameText[index].replace('[', heroesInKill[0] + '[');
    frameText[index] += heroesInKill[1];
    var ability = await getAbilities(heroesInKill[0], killfeedFrames[i], isUlt);
  }
}
async function runOCR(frame, splitPoint, isHeadshot, isUlt) {
  var basicText;
  Jimp.read(frame)
    .then(image => {
      var victim = image.clone();
      image.crop(0, 0, splitPoint[0], image.bitmap.height);
      victim.crop(0, splitPoint[0], image.bitmap.width - splitPoint[0], image.bitmap.height);
      Tesseract.recognize(
        image,
        'eng',
        { logger: m => console.log(m) }
      ).then(({ data: { text } }) => {
        basicText = text + '[headshot:' + isHeadshot + '][ult:' + isUlt + ']->';
      });
      Tesseract.recognize(
        victim,
        'eng',
        { logger: m => console.log(m) }
      ).then(({ data: { text } }) => {
        basicText += text;
      });
    });
  return basicText;
}

async function getHeroes(frame, splitPoint, isHeadshot, isUlt) {
  var basicText = [];
  Jimp.read(frame)
    .then(image => {
      var victim = image.clone();
      image.crop(0, 0, splitPoint[0], image.bitmap.height);
      victim.crop(splitPoint[0], 0, image.bitmap.width - splitPoint[0], image.bitmap.height);
      var promiseLeft = image.getBufferAsync(Jimp.MIME_PNG);
      var promiseRight = victim.getBufferAsync(Jimp.MIME_PNG);
      promiseLeft.then(function (result) {
        const imageMatrix = new cv.Mat(result, 1080, 1920, cv.CV_8UC3);
        if (isUlt) {
          if (isHeadshot) {
            for (let index = 0; index < canHeadshotUlt; index++) {
              const matched = imageMatrix.matchTemplate(heroIconsUlts[index], 5);
              const point = matched.minMaxLoc();
              if (point[1] > 0.8) {
                basicText = '[' + killingUlts[index] + ']->';
                break;
              }
            }
          }
          else {
            for (let index = 0; index < killingUlts.length; index++) {
              const matched = imageMatrix.matchTemplate(heroIconsUlts[index], 5);
              const point = matched.minMaxLoc();
              if (point[1] > 0.8) {
                basicText = '[' + killingUlts[index] + ']->';
                break;
              }
            }
          }
        }
        else {
          if (isHeadshot) {
            for (let index = 0; index < canHeadshotNormal; index++) {
              const matched = imageMatrix.matchTemplate(heroIcons[index], 5);
              const point = matched.minMaxLoc();
              if (point[1] > 0.8) {
                basicText = '[' + heroes[index] + ']->';
                break;
              }
            }
          }
          else {
            for (let index = 0; index < heroes.length; index++) {
              const matched = imageMatrix.matchTemplate(heroIcons[index], 5);
              const point = matched.minMaxLoc();
              if (point[1] > 0.8) {
                basicText[0] = '[' + heroes[index] + ']';
                break;
              }
            }
          }
        }
      });
      promiseRight.then(function (result) {
        const imageMatrix = new cv.Mat(result, 1080, 1920, cv.CV_8UC3);
        for (let index = 0; index < heroes.length; index++) {
          const matched = imageMatrix.matchTemplate(heroIcons[index], 5);
          const point = matched.minMaxLoc();
          if (point[1] > 0.8) {
            basicText[1] = '[' + heroes[index] + ']';
            break;
          }
        }
      }

      );
    });
  return basicText;
}
async function getAbilities(hero, frame, isUlt) {
  Jimp.read(frame)
    .then(image => {
      image.crop(0, 0, splitPoint[0], image.bitmap.height);
      var promise = image.getBufferAsync(Jimp.MIME_PNG);
      promise.then(function (result) {
        const imageMatrix = new cv.Mat(result, 1080, 1920, cv.CV_8UC3);
        for (let index = 0; index < heroes.length; index++) {
          const matched = imageMatrix.matchTemplate(heroIcons[index], 5);
          const point = matched.minMaxLoc();
          if (point[1] > 0.8) {
            basicText[1] = '[' + heroes[index] + ']';
            break;
          }
        }
      }

      );
    });
}