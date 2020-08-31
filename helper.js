'use strict'

const fs = require('fs')
const axios = require('axios')
const sharp = require('sharp')
const tmpPath = './tmp/'

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

        let bitmap = fs.readFileSync(tmpFilePath)
        let imageData = Buffer.from(bitmap).toString('base64')
        let result = await axios({
            url: req.firebaseHost + '/upload',
            method: 'post',
            data: {
                filename: fileName,
                image: imageData
            }
        })
        .then(({ data}) => {
            return req.firebaseHost + data.path_url
        })

        fs.unlinkSync(tmpFilePath)
        return result
    }
}

module.exports = new Helper
