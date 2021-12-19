"use strict"

const _ = require("lodash")
const R = require("ramda")
const Promise = require("bluebird")

const SteamAccount = require("./steamaccount")
const manageDB = require("./database")

const database = manageDB.read()

/*const telebot = require("./telebot")
telebot()*/

if (database.length === 0) {
  console.error(
    "[!] No accounts have been added! Please run 'node user' to add accounts!"
  )
  process.exit(0)
}

const pad = 24 + _.maxBy(R.pluck("name", database), "length").length
const accounts = database
  .map(({ name, password, sentry, secret, games = [] }) => {
    return games.length > 0
      ? new SteamAccount(name, password, sentry, secret, games, pad)
      : null
  })
  .filter(val => val !== null)

const restartBoost = () => {
  console.log("[=] Restarting accounts")
  return Promise.map(accounts, _.method("restartGames"))
    .delay(30000)
    .finally(restartBoost)
}

console.log("[=] Start accounts")
Promise.map(accounts, _.method("boost"))
  .delay(30000)
  .then(restartBoost)
