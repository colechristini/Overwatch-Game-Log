
var killfeed = require('../killfeed');
var expect = require('chai').expect;

describe('#extractFrames()', function() {

	context('1 kill occurs, headshot, non spectator', function() {
		it('should return one kill with storm arrow headshot', async function() {

			// use await to wait until the promise is fulfilled
			var data = await extractFrames("../resources/test/test_1.mp4", false);

			// add some assertions
			expect(data)
				.to.be.a('array').and.to.have.members(['[0:0:0]: EventHorizon[Hanzo][Storm Arrows][headshot:true][ult:false]->Nope3[Hanzo]', '[0:0:500] ']);;
		})

	})

	context('with non-string argument', function() {
		context('tracer gets melee kill on hanzo, mercy resurrects, tracer pulse bombs hanzo, is spectator', function() {
			it('should return one kill with melee, a resurrection, and tracer pulse bombing hanzo', async function() {

				// use await to wait until the promise is fulfilled
				var data = await extractFrames("../resources/test/test_2.mp4", true);

				// add some assertions
				expect(data)
					.to.be.a('array').and.to.have.members(['[0:0:0]: Secret[Tracer][Blue][Melee][headshot:false][ult:false]->Nope3[Hanzo]', '[0:1:800]: Bentup[Mercy][Red[Resurrection][headshot:false][ult:false]->Nope3[Hanzo][Red]', '[0:5:200]: Secret[Tracer][Blue][Pulse Bomb][headshot:false][ult:true]->Nope3[Hanzo][Red]']);
			})
		})
	})
})
