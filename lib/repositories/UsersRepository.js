"use strict";
var _ = require('lodash');
var bcrypt = require('bcryptjs');
var nodeify = require('nodeify');
var Promise = require('es6-promise').Promise;

/**
 * Encrypt the specified password.
 * @param {string} password The password to encrypt
 * @param {function} [callback] signature (err, hash)
 * @returns {Promise} if callback is not provided, returns a promise which resolves to the encrypted password hash
 */
function encryptPassword(password, callback) {

  if (callback) {
    return nodeify(encryptPassword(password), callback);
  }

  return new Promise(function (resolve, reject) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        reject(err);
        return;
      }

      bcrypt.hash(password, salt, function (err, hash) {
        if (err) {
          reject(err);
          return;
        }

        resolve(hash);
      });
    });
  });
}

/**
 * Create an instance of User, wrapping a POJO with methods to help work on a user.
 *
 * @param {object} obj The POJO to wrap with user-specific helper methods
 * @param {object} repository The UsersRepository instance to use when saving the user
 * @constructor
 */
function User(obj, repository) {
  var originalValues = obj;
  _.merge(this, obj);

  // make the 'repository' property a non-enumerable getter
  Object.defineProperty(this, 'repository', {
    enumerable: false,
    configurable: false,
    get: function () {
      return repository;
    }
  });

  // make the 'repository' property a non-enumerable getter
  Object.defineProperty(this, 'originalValues', {
    enumerable: false,
    configurable: false,
    value: originalValues
  });
}

/**
 * Compare a candidate password with the actual password for the user.
 *
 * @param {string} candidatePassword The password to check for a match
 * @param {function} [callback] signature (err, isMatch)
 * @returns {Promise} if callback is not provided, returns a promise which resolves to `isMatch`
 */
User.prototype.comparePassword = function (candidatePassword, callback) {
  var self = this;

  if (callback) {
    return nodeify(self.comparePassword(candidatePassword), callback);
  }

  return new Promise(function (resolve, reject) {
    if (!self.password) {
      resolve(false);
      return;
    }

    bcrypt.compare(candidatePassword, self.password, function (err, isMatch) {
      if (err) {
        reject(err);
        return;
      }

      resolve(isMatch);
    });
  });
};

/**
 * Save the User, encrypting the password if it has been changed.
 *
 * @param {function} [callback] signature (err, savedUser)
 * @returns {Promise} if callback is not supplied, returns a promise which resolves to the saved user
 */
User.prototype.save = function (callback) {
  if (callback) {
    return nodeify(this.save(), callback);
  }

  return this.repository.save(this);
};

/**
 * Destroy the user, removing it from the store.
 *
 * @param {function} [callback] signature (err)
 * @returns {Promise} if callback is not supplied, returns a promise
 */
User.prototype.destroy = function (callback) {
  if (callback) {
    return nodeify(this.destroy(), callback);
  }

  return this.repository.remove(this);
};

/**
 * Remove sensitive fields from JSON representation of the object
 *
 * @returns {object}
 */
User.prototype.toJSON = function () {
  var copy = _.cloneDeep(this);
  delete copy.password;
  return copy;
};

/**
 * Creates an instance of UsersService, providing access to data storage for users.
 *
 * @param {object} options
 * @param {object} options.store The backing nedb Datastore for the users
 * @constructor
 */
function UsersRepository(options) {
  // make the 'store' property a non-enumerable getter
  Object.defineProperty(this, 'store', {
    enumerable: false,
    configurable: false,
    get: function () {
      return options.store;
    }
  });
}

/**
 * Creates a new user. If `password` field in params, will automatically encrypt it.
 *
 * @param {object} params
 * @param {function} [callback] signature is (err, user)
 * @returns {Promise} if callback is not specified, returns a promise that resolves to the created user
 */
UsersRepository.prototype.create = function (params, callback) {
  var self = this;

  if (callback) {
    return nodeify(this.create(params), callback);
  }

  var createParams = _.cloneDeep(params);

  return Promise.resolve().then(function () {
    if (_.has(createParams, 'password')) {
      return encryptPassword(createParams.password).then(function (hash) {
        createParams.password = hash;
      });
    }
  }).then(function () {
    return new Promise(function (resolve, reject) {
      self.store.insert(createParams, function (err, result) {
        if (err) {
          reject(err);
          return;
        }

        resolve(new User(result, self));
      });
    });
  });
};

/**
 * Retrieve all users that match the specified `criteria`.
 *
 * @param {object} criteria The criteria to use to lookup the users
 * @param {function} [callback] signature is (err, users)
 * @returns {Promise} if callback is not specified, returns a promise that resolves to the found users
 */
UsersRepository.prototype.find = function (criteria, callback) {
  var self = this;

  if (callback) {
    return nodeify(this.find(criteria), callback);
  }

  return new Promise(function (resolve, reject) {
    self.store.find(criteria, function (err, results) {
      if (err) {
        reject(err);
        return;
      }

      results = results.map(function (result) {
        return new User(result, self);
      });

      resolve(results);
    });
  });
};

/**
 * Retrieves a single user that matches the specified email
 *
 * @param {string} email The email address of the user
 * @param {function} [callback] signature is (err, user)
 * @returns {Promise} if callback is not specified, returns a promise that resolves to the found user
 */
UsersRepository.prototype.findOneByEmail = function (email, callback) {
  var self = this;

  if (callback) {
    return nodeify(this.findOneByEmail(email), callback);
  }

  return new Promise(function (resolve, reject) {
    self.store.findOne({ email: email }, function (err, result) {
      if (err) {
        reject(err);
        return;
      }

      resolve(result ? new User(result, self) : null);
    });
  });
};

/**
 * Retrieves a single user that matches the specified id
 *
 * @param {string} id the id of the user
 * @param {function} [callback] signature is (err, user)
 * @returns {Promise} if callback is not specified, returns a promise that resolves to the found user
 */
UsersRepository.prototype.findOneById = function (id, callback) {
  var self = this;

  if (callback) {
    return nodeify(this.findOneById(id), callback);
  }

  return new Promise(function (resolve, reject) {
    self.store.findOne({ _id: id }, function (err, result) {
      if (err) {
        reject(err);
        return;
      }

      resolve(result ? new User(result, self) : null);
    });
  });
};

/**
 * Retrieve a single user that matches the specified profileId
 *
 * @param {string} profileType The type of the profile, i.e. 'github' or 'google'
 * @param {string} id The identifier of the user within that profile.
 * @param {function} [callback] signature is (err, user)
 * @returns {Promise} if callback is not specified, returns a promise that resolves to the found user
 */
UsersRepository.prototype.findOneByProfileId = function (profileType, id, callback) {
  var self = this;

  if (callback) {
    return nodeify(this.findOneByProfileId(profileType, id), callback);
  }

  return new Promise(function (resolve, reject) {
    var criteria = {};
    criteria[profileType + '.id'] = id;

    self.store.findOne(criteria, function (err, result) {
      if (err) {
        reject(err);
        return;
      }

      resolve(result ? new User(result, self) : null);
    });
  });
};

/**
 * Saves the user to the store. If `password` field has been changed, will automatically encrypt it.
 *
 * @param {User} user The user to save.
 * @param {function} [callback] signature (err, savedUser)
 * @returns {Promise} if callback is not specified, returns a promise that resolves to the saved user
 */
UsersRepository.prototype.save = function (user, callback) {
  var self = this;

  if (callback) {
    return nodeify(self.save(user), callback);
  }

  if (!user._id) {
    return self.create(user);
  }

  var props = _.merge({}, user);

  return Promise.resolve().then(function () {
    // hash password if needed
    if (props.password && (!user.originalValues || (props.password !== user.originalValues.password))) {
      return encryptPassword(props.password).then(function (hash) {
        props.password = hash;
      });
    }
  }).then(function () {
    return new Promise(function (resolve, reject) {
      self.store.update({ _id: props._id }, props, function (err, numUpdated) {
        if (err) {
          reject(err);
          return;
        }

        if (numUpdated !== 1) {
          reject(new Error('user not found'));
          return;
        }

        resolve(new User(props, self));
      });
    });
  });
};

/**
 * Remove a user from the store.
 *
 * @param {User} user The user to remove.
 * @param {function} [callback] signature (err)
 * @returns {Promise} if callback is not specified, returns a promise that resolves to the saved user
 */
UsersRepository.prototype.remove = function (user, callback) {
  var self = this;

  if (callback) {
    return nodeify(self.destroy(user), callback);
  }

  return new Promise(function (resolve, reject) {
    if (!user._id) {
      throw new Error('User must have an _id to search on');
    }

    self.store.remove({ _id: user._id }, function (err) {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
};

module.exports = UsersRepository;
module.exports.User = User;
