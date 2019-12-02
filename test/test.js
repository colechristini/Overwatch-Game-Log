
var killfeed = require('../killfeed');
var expect = require('chai').expect;

describe('#extractFrames()', async function() {

	context('1 kill occurs, headshot, non spectator', function() {
		it('should return one kill with storm arrow headshot', async function() {

			// use await to wait until the promise is fulfilled
			let data = await extractFrames("../resources/test/test_1.mp4", false) .catch(error => console.log(error));

			// add some assertions
			expect(data)
				.to.be.a('array').and.to.have.members(['NOVA[Hanzo][Storm Arrows][headshot:true][ult:false]->BIPOLAR[Hanzo]', '[0:0:500] ']);;
		})

	})

	context('with non-string argument', function() {
		context('tracer gets melee kill on hanzo, mercy resurrects, tracer pulse bombs hanzo, is spectator', function() {
			it('should return one kill with melee, a resurrection, and tracer pulse bombing hanzo', async function() {

				// use await to wait until the promise is fulfilled
				let data = await extractFrames("../resources/test/test_2.mp4", true) .catch(error => console.log(error));

				// add some assertions
				expect(data)
					.to.be.a('array').and.to.have.members(['NOVA[Hanzo][Blue][Melee][headshot:false][ult:false]->BIPOLAR[Hanzo]', 'KIWI[Mercy][Red[Resurrection][headshot:false][ult:false]->BIPOLAR[Hanzo][Red]', 'NOVA[Hanzo][Blue][Dragonstrike][headshot:false][ult:true]->BIPOLAR[Hanzo][Red]']);
			})
		})
	})
})
