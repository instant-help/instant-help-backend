const authModel = require('../models/auth')
const jwt = require('jsonwebtoken')

function isAuthenticated(req, res, next) {
  if (!req.headers.authorization) {
    return next({
      status: 401,
      message: 'Unauthorized'
    })
  }
  const [scheme, credentials] = req.headers.authorization.split(' ')
  jwt.verify(credentials, process.env.SECRET, (err, payload) => {
    console.log(payload, err)
    if (err) {
      return next({
        status: 401,
        message: 'Unautorized'
      })
    }
    req.claim = payload
    next()
  })
}

function getAuthStatus(req, res, next) {
  res.status(200).send({
    ...req.claim
  })
}

function login(req, res, next) {
  if (!req.body.username) {
    return next({
      status: 400,
      message: 'Bad request'
    })
  }
  if (!req.body.password) {
    return next({
      status: 400,
      message: 'Bad request'
    })
  }
  authModel.login(req.body.username, req.body.password)
    .then(function ({
      id,
      username
    }) {
      const token = jwt.sign({
        id,
        username
      }, process.env.SECRET)
      return res.status(200).send({
        token
      })
    })
    .catch(next)
}

module.exports = {

  isAuthenticated,
  getAuthStatus,
  login

}