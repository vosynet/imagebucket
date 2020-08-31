'use strict'

const fs = require('fs')
const tmpPath = './tmp/'
const { nanoid } = require('nanoid')
const formidable = require('formidable')
const download = require('download')
const helper = require('./helper')
const exts = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
}

class Controller {
    async index(req, res) {
        res.send('Please visit https://vosy.net/imagebucket !')
    }

    async uploadJson(req, res) {
        try {
            let type = '.jpg'
            for (let t of Object.keys(exts)) {
                if (req.body.image.indexOf(t) > 0) {
                    type = exts[t]
                    break
                }
            }

            let fileName = nanoid() + type
            let imageData = req.body.image.split('base64,').reverse()[0]
            fs.writeFileSync(tmpPath + fileName, imageData, 'base64')

            let imageUrl = await helper.deployImage(req, fileName)
            if (!imageUrl) throw new Error('-')

            res.send({
                success: true,
                url: imageUrl
            })
        }
        catch(err) {
            console.error(err)
            res.send({
                success: false
            })
        }
    }

    async uploadFile(req, res) {
        try {
            let form = formidable({ multiples: false, uploadDir: tmpPath })
            form.parse(req, async function(err, fields, files) {
                req.body = Object.assign(req.body, fields)
                let fileName = nanoid() + exts[files.image.type]
                fs.renameSync(files.image.path, tmpPath + fileName)

                let imageUrl = await helper.deployImage(req, fileName)
                if (!imageUrl) throw new Error('-')
    
                res.send({
                    success: true,
                    url: imageUrl
                })
            })
        }
        catch(err) {
            console.error(err)
            res.send({
                success: false
            })
        }
    }
    async uploadUrl(req, res) {
        try {
            let type = req.body.image.split('.').reverse()[0]
            let fileName = nanoid() + '.' + type
            fs.writeFileSync(tmpPath + fileName, await download(req.body.image))

            let imageUrl = await helper.deployImage(req, fileName)
            if (!imageUrl) throw new Error('-')

            res.send({
                success: true,
                url: imageUrl
            })
        }
        catch(err) {
            console.error(err)
            res.send({
                success: false
            })
        }
    }
}

module.exports = new Controller
