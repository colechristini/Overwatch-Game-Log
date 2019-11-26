const fs = require("fs");
const util = requite("util");
const memfs = require("memfs");
const Tesseract = require("tesseract.js")
const ffmpeg = require("fluent-ffmpeg");
const Jimp = require("jimp");
const cv = require("opencv4nodejs");
const NodeCache = require("node-cache");
const myArgs = process.argv.slice(2);
var vodDuration = 0;
const vol = new memfs.Volume();
var frameData = [];
const cropKillfeedPOV = [1388, 36];
const cropKillfeedSpectator = [1388, 170];
const cropKillfeedDimensions = [500, 310];
const cropUltsSpectator = 160;
const killArrows = [cv.imread("./resources/arrows/normal.png"), cv.imread("./resources/arrows/ult.png")];
const arrowColors = [0xFFFFFF, 0x240AFE];
const iconWidth = 25;
const teamColors = [0xD1BF80, 0x6E72F9];
var heroes = JSON.parse(fs.readFileSync("./heroes.json", "utf8"));
const canHeadshotNormal = 21;
const canHeadshotUlt = 2;
var killCache = new NodeCache(stdTTL = 15, useClones = false);
var isSpectator = false;

var dataPromise = util.promisify(extractFrames(myArgs[0], myArgs[2]));
dataPromise.then((result) => {
  frameData = Array.from(new Set(result));
  var file = fs.createWriteStream(myArgs[1]);
  file.on('error', function (err) { throw err; });
  frameData.forEach(function (data) { file.write(data + '\n'); });
  file.end();
});


async function extractframes(path, isSpectatorParam) {
  let data = [];
  isSpectator = isSpectatorParam;
  let promise = util.promisify(ffmpeg.ffprobe(path));
  metadata = await promise;
  vodDuration = metadata.format.duration;
  vol.mkdir("./frames");
  for (let index = 0; index < vodDuration * 10; index++) {
    let dataPromise = extractFrame(path, index);
    let frameText = await dataPromise;
    for (let frameEntry = 0; frameEntry < frameText.length; frameEntry++) {
      data[index + frameEntry] = "[" + Math.floor(index / 600) + ":" + (index / 600) % 60 + ":" + (index % 10) * 100 + "]: " + frameText[frameEntry];//generate timestamp from framenumber and insert into array
    }
  }
}
async function extractFrame(path, framenumber) {
  var frame;
  let ffstream = ffmpeg(path)
    .setStartTime((framenumber % 10) + (60 * (framenumber - framenumber % 10)))
    .frames(1)
    .format("png")
    .stream(frame.stream)
    .withInputOption("-i")
    .pipe();
  let data = [];
  ffstream.on("data", function (chunk) {
    this.data.push(chunk);
  });
  ffstream.on("finished", function () {
    frame = Buffer.concat(array);
  });

  let frameText = await cropFrame(frame, framenumber).then(checkKillfeedArrows(framenumber));
  return frameText;
}

async function cropFrame(buffer, framenumber) {
  let crop = [];
  vol.mkdir("./frames/frame_" + framenumber);
  if (isSpectator == true) {
    crop = cropSpectator;
  }
  else {
    crop = cropPOV;
  }
  Jimp.read(buffer)
    .then(image => {
      image.crop(crop[0], crop[1], crop[0] + cropKillfeedDimensions[0], crop[1] + cropKillfeedDimensions[1]);
      let killfeed = [];
      for (let index = 0; index < 6; index++) {
        killfeed[i] = image.clone().crop(crop[0], crop[1] + Math.floor(i * cropKillfeedDimensions[1] / 6), cropKillfeedDimensions[0], Math.floor(i * cropKillfeedDimensions[1] / 6));
        let file = "./frames/frame_" + framenumber + "_killfeed_" + i + image.getExtension();
        let promise = killfeed[i].getBufferAsync(Jimp.MIME_PNG);
        promise.then(async function (result) {
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
    vol.readFile("./frames/frame_" + framenumber + "_killfeed_" + i + image.getExtension(), (err, data) => {
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
          if (imageMatrix.atBGR(point[2], point[3]) == colors[1]) {
            isHeadshot = true;
          }
          else {
            isHeadshot = false;
          }
        }
      });
    });
    var content = [];
    content = await runOCR(killfeedFrames[i], point, isHeadshot, isUlt);
    if (content[0] == null) {
      break;
    }
    if (killCache.get(content[0] + "->" + content[1]) == null) {
      var heroesInKill = await getHeroes(killfeedFrames[i], point, isHeadshot, isUlt);
      var ability = await getAbilities(heroesInKill[0], killfeedFrames[i], isUlt);
      if (ability == "Resurrection") {
        for (let key in killCache.keys()) {
          if (key.includes(userNames[1])) {
            killCache.del(key);
            break;
          }
        }
      }
      killCache.set(content[0] + "->" + content[1]);
      content[0].replace("[", heroesInKill[0] + "[");
      content[1] += heroesInKill[1];
      content[0].replace("]", ability + "]");
      frameText[index] = content[0] + "->" + content[1];
    }
    else {
      continue;
    }
  }
  return frameText;
}
async function runOCR(frame, splitPoint, isHeadshot, isUlt) {
  var basicText = [];
  Jimp.read(frame)
    .then(image => {
      var victim = image.clone();
      image.crop(0, 0, splitPoint[0], image.bitmap.height);
      victim.crop(0, splitPoint[0], image.bitmap.width - splitPoint[0], image.bitmap.height);
      Tesseract.recognize(
        image,
        "eng",
        { logger: m => console.log(m) }
      ).then(({ data: { text } }) => {
        basicText[0] = text + "[headshot:" + isHeadshot + "][ult:" + isUlt + "]";
      });
      Tesseract.recognize(
        victim,
        "eng",
        { logger: m => console.log(m) }
      ).then(({ data: { text } }) => {
        basicText[1] = text;
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
      promiseLeft.then(async function (result) {
        const imageMatrix = new cv.Mat(result, 1920, 1080, cv.CV_8UC3);
        if (isHeadshot) {
          for (let index = 0; index < canHeadshotNormal; index++) {
            if (isUlt && heroes[index].canUlt || !isUlt) {
              var templateMat;
              var maskMat;
              if (!heroes[index].fileLoaded) {
                templateMat = await cv.imreadAsync("./resources/" + heroes[index].name + "/" + heroes[index].icon);
                maskMat = await cv.imreadAsync("./resources/" + heroes[index].name + "/mask_" + heroes[index].icon);
                heroes[index].fileLoaded = true;
                heroes[index].icon = templateMat;
                heroes[index].mask = maskMat;
              }
              else {
                var templateMat = heroes[index].icon;
              }
              const matched = imageMatrix.matchTemplate(templateMat, 5, mask = maskMat);
              const point = matched.minMaxLoc();
              if (point[1] > 0.8) {
                basicText = "[" + heroes[index].name + "]";
                if (imageMatrix.atBGR(point[0] + iconWidth + 1, point[1]) == teamColors[0]) {
                  basicText[0].replace("]", "][Team 1]")
                }
                else if (imageMatrix.atBGR(point[0] + iconWidth + 1, point[1]) == teamColors[1]) {
                  basicText[0].replace("]", "][Team 2]");
                }
                break;
              }
            }
            else if (isUlt && !heroes[index].canUlt) {
              continue;
            }
          }
        }
        else {
          for (let index = 0; index < canHeadshotNormal; index++) {
            var templateMat;
            var maskMat
            if (isUlt && heroes[index].canUlt || !isUlt) {
              if (!heroes[index].fileLoaded) {
                templateMat = await cv.imreadAsync("./resources/" + heroes[index].name + "/" + heroes[index].icon);
                maskMat = await cv.imreadAsync("./resources/" + heroes[index].name + "/mask_" + heroes[index].icon);
                heroes[index].fileLoaded = true;
                heroes[index].icon = templateMat;
                heroes[index].mask = maskMat;
              }
              else {
                templateMat = heroes[index].icon;
                maskMat = heroes[index].mask;
              }
              const matched = imageMatrix.matchTemplate(templateMat, 5, mask = maskMat);
              const point = matched.minMaxLoc();
              if (point[1] > 0.8) {
                basicText[1] = "[" + heroes[index].name + "]";
                if (imageMatrix.atBGR(point[0] + iconWidth + 1, point[1]) == teamColors[0]) {
                  basicText[1].replace("]", "][Team 1]")
                }
                else if (imageMatrix.atBGR(point[0] + iconWidth + 1, point[1]) == teamColors[1]) {
                  basicText[1].replace("]", "][Team 2]");
                }
                break;
              }
            }
            else if (isUlt && !heroes[index].canUlt) {
              continue;
            }
          }
        }
      });
      promiseRight.then(async function (result) {
        const imageMatrix = new cv.Mat(result, 1080, 1920, cv.CV_8UC3);
        var templateMat;
        var maskMat;
        for (let index = 0; index < heroes.length; index++) {
          if (!heroes[index].fileLoaded) {
            templateMat = await cv.imreadAsync("./resources/" + heroes[index].name + "/" + heroes[index].icon);
            maskMat = await cv.imreadAsync("./resources/" + heroes[index].name + "/mask_" + heroes[index].icon);
            heroes[index].fileLoaded = true;
            heroes[index].icon = templateMat;
            heroes[index].mask = maskMat;
          }
          else {
            templateMat = heroes[index].icon;
            maskMat = heroes[index].mask;
          }
          const matched = imageMatrix.matchTemplate(templateMat, 5, mask = maskMat);
          const point = matched.minMaxLoc();
          if (point[1] > 0.8) {
            basicText += "[" + heroes[index].name + "]";
            break;
          }
        }
      });
    });
  var ability = await getAbilities(basicText[0], frame, isUlt);
  basicText[0] += "[" + ability + "]";
  return basicText;
}

async function getAbilities(hero, frame, isUlt) {
  var basicText = new String;
  Jimp.read(frame)
    .then(image => {
      image.crop(0, 0, splitPoint[0], image.bitmap.height);
      var promise = image.getBufferAsync(Jimp.MIME_PNG);
      promise.then(async function (result) {
        const imageMatrix = new cv.Mat(result, 1080, 1920, cv.CV_8UC3);
        const heroIndex = heroes.findIndex(({ name }) => name === hero);
        var templateMat;
        var maskMat;
        if (isUlt) {
          basicText = "[" + heroes[heroIndex].abilities.Ultimate.name + "]";
        }
        else {
          for (var ability in heroes[heroIndex].abilities) {
            if (!heroes[heroIndex].ability.fileLoaded) {
              templateMat = await cv.imreadAsync("./resources/" + hero + "/" + heroes[heroIndex].abilities[ability].icon);
              maskMat = await cv.imreadAsync("./resources/" + heroes[index].name + "/mask_" + heroes[heroIndex].abilities[ability].icon);
              heroes[heroIndex].abilities[ability].fileLoaded = true;
              heroes[heroIndex].abilities[ability].icon = templateMat;
              heroes[heroIndex].abilities[ability].mask = maskMat;
            }
            else {
              templateMat = heroes[heroIndex].abilities[ability].icon;
              maskMat = heroes[heroIndex].abilities[ability].mask;
            }
            const matched = imageMatrix.matchTemplate(templateMat, 5, mask = maskMat);
            const point = matched.minMaxLoc();
            if (point[1] > 0.8) {
              basicText = "[" + heroes[heroIndex].abilities[ability].name + "]";
              break;
            }
            else {
              continue;
            }
          }
        }
      });
    });
  return basicText;
}
