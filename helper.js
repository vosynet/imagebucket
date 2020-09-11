'use strict'

const fs = require('fs')
const sharp = require('sharp')
const moment = require('moment')
const tmpPath = './tmp/'
const admin = require('firebase-admin')
const serviceAccount = require('./service.json')
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

class Helper {
    async resizeImage(path, size) {
        try {
            let pathArr = path.split('/').reverse()
            pathArr[0] = 're_' + pathArr[0]
            let pathNew = pathArr.reverse().join('/')
            await sharp(path).resize(size).toFile(pathNew)
            fs.renameSync(pathNew, path)
            return true
        }
        catch(err) {
            console.error(err)
            return false
        }
    }

    async deployImage(req, fileName) {
        let tmpFilePath = tmpPath + fileName
        if (Number(req.body.width) || Number(req.body.height)) {
            let size = {
                width: Number(req.body.width) || null,
                height: Number(req.body.height) || null,
            }
            let resizing = await this.resizeImage(tmpFilePath, size)
            if (!resizing) return false
        }

        let date = moment().format('YYYYMMDD')
        await bucket.upload(tmpFilePath, {
            destination: date + '/' + fileName,
            public: true,
        })

        fs.unlinkSync(tmpFilePath)
        return `${config.cdnDomain}/${date}/${fileName}`
    }
}

module.exports = new Helper
