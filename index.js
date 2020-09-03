'use strict'

require('dotenv').config()
const express = require('express')
const app = express()
const ctrl = require('./controller')
const cors = require('cors')
const fs = require('fs')
const bodyParser = require('body-parser')
const port = process.env.PORT || 4000

try {
	const serviceAccount = require('./firebase/service.json')
	process.env.FIREBASE_HOST = `https://${serviceAccount.project_id}.web.app`
	process.env.PRIVATE_KEY = serviceAccount.private_key_id
}
catch(err){
	throw new Error('service.json was invalid')
}	

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

