'use strict'

const base64Img = require('base64-img')
const fs = require('fs')
const tmpPath = './tmp/'
const { nanoid } = require('nanoid')
const formidable = require('formidable')
const download = require('download')
const helper = require('./helper')

class Controller {
    async index(req, res) {
        res.send('Please visit https://vosy.net/imagebucket !')
    }

    async uploadJson(req, res) {
        try {
            let fileName = await base64Img.imgSync(req.body.image, tmpPath, nanoid())
            fileName = fileName.split('/').reverse()[0]

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
            let exts = {
                'image/jpeg': '.jpg',
                'image/png': '.png',
            }
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
