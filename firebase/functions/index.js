'use strict'

const functions = require('firebase-functions')
const express = require("express")
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')
const os = require('os')
const moment = require('moment')
const tmpPath = os.tmpdir()
const admin = require('firebase-admin')
const serviceAccount = require('./auth.json')
const projectId = serviceAccount.project_id
const config = {
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${projectId}.firebaseio.com`,
    projectId: projectId,
    storageBucket: `${projectId}.appspot.com`,
    cdnDomain: `https://storage.googleapis.com/${projectId}.appspot.com`,
    projectHost: `https://${projectId}.web.app`
}
const firebase = admin.initializeApp(config)
const bucket = firebase.storage().bucket()

app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/file/*', async function(req, res) {
    let fileName = req.params[0]
    res.redirect(config.cdnDomain + '/' + fileName)
})

app.post('/upload', async function(req, res) {
    try {
        let name = req.body.filename
        let tempFilePath = path.join(tmpPath, name)
        let date = moment().format('YYYYMMDD')
        let imageData = req.body.image.split('base64,').reverse()[0]
        fs.writeFileSync(tempFilePath, imageData, 'base64')
        await bucket.upload(tempFilePath, {
            destination: date + '/' + name,
            public: true,
        })
        res.send({
            url: `${config.projectHost}/file/${date}/${name}`
        })
    }
    catch(err) {
        res.status(500).send(err.message)
    }
})

exports.api = functions.https.onRequest(app)
