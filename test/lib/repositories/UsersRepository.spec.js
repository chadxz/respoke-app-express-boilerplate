'use strict';
var Datastore = require('nedb');
var dirtyChai = require('dirty-chai');
var chai = require('chai');
var expect = chai.expect;
chai.use(dirtyChai);

describe("the UsersRepository", function () {

  var memoryStore = new Datastore({ inMemoryOnly: true, autoload: true });
  var UsersRepository = require('../../../lib/repositories/UsersRepository');
  var Users = new UsersRepository({ store: memoryStore });

  afterEach(function (done) {
    // remove all documents after each test
    memoryStore.remove({ _id: { $ne: null } }, { multi: true }, done);
  });

  it("is a constructor", function () {
    expect(Users).to.be.an('object');
    expect(Users).to.be.an.instanceof(UsersRepository);
  });

  describe("create method", function () {

    it("works", function () {
      expect(Users.create).to.be.a('function');
      return Users.create({ foo: 'bar' }).then(function (user) {
        expect(user).to.exist();
        expect(user).to.include.property('_id');
        expect(user._id).to.not.be.empty();
        expect(user).to.include.property('foo', 'bar');
        expect(user.comparePassword).to.be.a('function');
        expect(user.save).to.be.a('function');
      });
    });

    it("hashes a password if one is provided", function () {
      return Users.create({ password: 'password' }).then(function (user) {
        expect(user).to.exist();
        expect(user.password).to.exist();
        expect(user.password).to.not.equal('password');
      });
    });
  });

  describe("findOneById", function () {

    it("exists", function () {
      expect(Users.findOneById).to.exist();
      expect(Users.findOneById).to.be.a('function');
    });

    it("works", function () {
      return Users.create({ foo: 'bar' }).then(function (createdUser) {
        expect(createdUser).to.exist();
        return Users.findOneById(createdUser._id).then(function (foundUser) {
          expect(foundUser).to.exist();
          expect(foundUser).to.deep.equal(createdUser);
        });
      });
    });
  });

  describe("save method", function () {

    it("exists", function () {
      expect(Users.save).to.exist();
      expect(Users.save).to.be.a('function');
    });

    it("works", function () {
      return Users.create({ foo: 'bar' }).then(function (user) {
        user.bang = 'bang';
        return Users.save(user).then(function (updatedUser) {
          expect(updatedUser).to.exist();
          expect(updatedUser).to.deep.equal(user);
          return Users.findOneById(updatedUser._id).then(function (foundUser) {
            expect(foundUser).to.exist();
            expect(foundUser).to.include.property('bang', 'bang');
          });
        });
      });
    });

    it("hashes a new password if it is set", function () {
      return Users.create({ foo: 'bar', password: 'keyboard cat' }).then(function (createdUser) {
        var originalPassword = createdUser.password;
        createdUser.password = 'fubu';
        return Users.save(createdUser).then(function (savedUser) {
          expect(savedUser.password).to.not.equal(originalPassword);
        });
      });
    });

    it("leaves the password alone if it is not changed", function () {
      return Users.create({ foo: 'bar', password: 'keyboard cat' }).then(function (createdUser) {
        createdUser.wings = true;
        return Users.save(createdUser).then(function (savedUser) {
          expect(savedUser.password).to.equal(createdUser.password);
        });
      });
    });
  });

  describe("The User model", function () {

    it("exists", function () {
      expect(UsersRepository.User).to.exist();
      expect(UsersRepository.User).to.be.a('function');
      return Users.create({ foo: 'bar' }).then(function (user) {
        expect(user).to.be.an.instanceof(UsersRepository.User);
      });
    });

    describe("comparePassword method", function () {

      it("returns true if the passwords are equal", function () {
        var actualPassword = 'monkey';
        return Users.create({ password: actualPassword }).then(function (user) {
          return user.comparePassword('monkey').then(function (isMatch) {
            expect(isMatch).to.equal(true);
          });
        });
      });

      it("returns false if the passwords are not equal", function () {
        var actualPassword = 'monkey';
        return Users.create({ password: actualPassword }).then(function (user) {
          return user.comparePassword('weasel').then(function (isMatch) {
            expect(isMatch).to.equal(false);
          });
        });
      });
    });
  });
});
