'use strict'

require('dotenv').config()
const express = require('express')
const app = express()
const ctrl = require('./controller')
const cors = require('cors')
const fs = require('fs')
const bodyParser = require('body-parser')
const port = process.env.PORT || 4000

if (!process.env.FIREBASE_HOST) throw new Error('Please define env: FIREBASE_HOST')
if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp')

app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(function(req, res, next) {
	req.firebaseHost = process.env.FIREBASE_HOST
	next()
})

app.get('/', ctrl.index)
app.post('/upload/json', ctrl.uploadJson)
app.post('/upload/file', ctrl.uploadFile)
app.post('/upload/url', ctrl.uploadUrl)

app.listen(port, () => console.log(`App listening at http://localhost:${port}`))

