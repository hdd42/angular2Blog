'use strict';

const path = require('path'),
      rootPath = path.normalize(__dirname + '/..'),
      env = process.env.NODE_ENV || 'development';
//const uuid = require('uuid');

console.log("env => ", env);
const config = {
  development: {
    root: rootPath,
    app: {
      name: 'src'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/blog-dev',
    secret: 'secret'
  },

  test: {
    root: rootPath,
    app: {
      name: 'Kurs Yonetimi'
    },
    port: 5000,
    db: 'mongodb://localhost/blog-test',
    secret: 'uuid()'
  },
  production: {
    root: rootPath,
    app: {
      name: 'src'
    },
    port: process.env.PORT || 80,
<<<<<<< HEAD
    db: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_URL}`
=======
    db: `mongodb://${ process.env.MONGO_USER }:${ process.env.MONGO_PASS }@${ process.env.MONGO_URL }`,
    secret: process.env.SECRET    
>>>>>>> b439bec8b70aa227d6bb3be373780c127580a761
  }
};

module.exports = config[env];
