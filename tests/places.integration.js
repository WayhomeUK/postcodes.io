"use strict";

const path = require("path");
const app = require(path.join(__dirname, "../server"));
const request = require("supertest");
const assert = require("chai").assert;
const helper = require(__dirname + "/helper");
const async = require("async");

describe("Places Routes", () => {
	before(function (done) {
		this.timeout(0);
		helper.clearPostcodeDb((error, result) => {
			if (error) return done(error);
			helper.seedPostcodeDb(done);
		});
	});

	after(helper.clearPostcodeDb);

	describe("/places/:id", () => {
		it ("returns a place by id", done => {
			const code = "osgb4000000074559490";
			request(app)
				.get(`/places/${code}`)
				.expect(200)
				.expect(helper.allowsCORS)
				.end((error, response) => {
					if (error) return done(error);
					assert.equal(response.body.status, 200);
					const place = response.body.result;
					assert.equal(place.code, code);
					helper.isPlaceObject(place);
					done();
				});
		});
		it ("is case insensitive", done => {
			const code = "osgb4000000074559490";
			request(app)
				.get(`/places/${code.toUpperCase()}`)
				.expect(200)
				.expect(helper.allowsCORS)
				.end((error, response) => {
					if (error) return done(error);
					assert.equal(response.body.status, 200);
					const place = response.body.result;
					assert.equal(place.code, code);
					helper.isPlaceObject(place);
					done();
				});
		});
		it ("returns 404 if place not a valid resource", done => {
			const code = "foo";
			request(app)
				.get(`/places/${code}`)
				.expect(404)
				.expect(helper.allowsCORS)
				.end((error, response) => {
					if (error) return done(error);
					assert.equal(response.body.status, 404);
					assert.isUndefined(response.body.result);
					assert.match(response.body.error, /place\snot\sfound/i);
					done();
				});
		});
		it ("responds to options", done => {
			const code = "osgb4000000074559490";
			request(app)
				.options(`/places/${code}`)
				.expect(204)
				.expect(helper.allowsCORS)
				.end((error, response) => {
					if (error) done(error);
					helper.validCorsOptions(response);
					done();
				});
		});
	});

	describe("/places?q= (search)", () => {
		it ("returns places by search term", done => {
			const query = "b";
			request(app)
				.get("/places")
				.query({ query: query })
				.expect(200)
				.expect(helper.allowsCORS)
				.end((error, response) => {
					if (error) return done(error);
					assert.equal(response.status, 200);
					const places = response.body.result;
					assert.isTrue(places.length > 0);
					places.forEach(p => helper.isPlaceObject(p));
					done();
				});
		});
		it ("accepts q as parameter", done => {
			const query = "b";
			request(app)
				.get("/places")
				.query({ q: query })
				.expect(200)
				.expect(helper.allowsCORS)
				.end((error, response) => {
					if (error) return done(error);
					assert.equal(response.status, 200);
					const places = response.body.result;
					assert.isTrue(places.length > 0);
					places.forEach(p => helper.isPlaceObject(p));
					done();
				});
		});
		it ("returns empty array if empty query", done => {
			request(app)
				.get("/places")
				.query({ query: " " })
				.expect(200)
				.expect(helper.allowsCORS)
				.end((error, response) => {
					if (error) return done(error);
					assert.equal(response.status, 200);
					assert.equal(response.body.result.length, 0);
					done();
				});
		});
		it ("returns empty array no matching places", done => {
			const query = "foobarbaz";
			request(app)
				.get("/places")
				.query({ query: query })
				.expect(200)
				.expect(helper.allowsCORS)
				.end((error, response) => {
					if (error) return done(error);
					assert.equal(response.status, 200);
					assert.equal(response.body.result.length, 0);
					done();
				});
		});
		it ("responds to options", done => {
			request(app)
				.options("/places")
				.expect(204)
				.expect(helper.allowsCORS)
				.end((error, response) => {
					if (error) done(error);
					helper.validCorsOptions(response);
					done();
				});
		});
		it ("accepts a limit paramater", done => {
			const query = "b";
			request(app)
				.get("/places")
				.query({ 
					query: query,
					limit: 1
				})
				.expect(200)
				.expect(helper.allowsCORS)
				.end((error, response) => {
					if (error) return done(error);
					assert.equal(response.status, 200);
					const places = response.body.result;
					assert.equal(places.length, 1);
					places.forEach(p => helper.isPlaceObject(p));
					done();
				});
		});
		it ("uses default limit if invalid", done => {
			const query = "b";
			request(app)
				.get("/places")
				.query({ 
					query: query,
					limit: "foo"
				})
				.expect(200)
				.expect(helper.allowsCORS)
				.end((error, response) => {
					if (error) return done(error);
					assert.equal(response.status, 200);
					const places = response.body.result;
					assert.equal(places.length, 10);
					places.forEach(p => helper.isPlaceObject(p));
					done();
				});
		});
		it ("accepts l as limit parameter", done => {
			const query = "b";
			request(app)
				.get("/places")
				.query({ 
					query: query,
					l: 1
				})
				.expect(200)
				.expect(helper.allowsCORS)
				.end((error, response) => {
					if (error) return done(error);
					assert.equal(response.status, 200);
					const places = response.body.result;
					assert.equal(places.length, 1);
					places.forEach(p => helper.isPlaceObject(p));
					done();
				});
		});
		it ("returns 400 if invalid limit", done => {
			request(app)
				.get("/places")
				.expect(400)
				.expect(helper.allowsCORS)
				.end((error, response) => {
					if (error) return done(error);
					assert.equal(response.body.status, 400);
					done();
				});
		});
	});

	describe("/random/places", () => {
		it ("returns a random place", done => {
			request(app)
				.get("/random/places")
				.expect(200)
				.expect(helper.allowsCORS)
				.end((error, response) => {
					if (error) return done(error);
					assert.equal(response.status, 200);
					helper.isPlaceObject(response.body.result);
					done();
				});
		});
	});
});
