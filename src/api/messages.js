import mongoClient from '../config/db.js'
import dayjs from 'dayjs'
import { stripHtml } from 'string-strip-html'
import { messagesSchema } from '../validations/messages.js'
import { ObjectId } from 'mongodb'

export const messagesPOST = async (req, res) => {
    let { to, text, type } = req.body
    let from = req.headers.user

    to = stripHtml(to).result
    text = stripHtml(text).result
    type = stripHtml(type).result
    from = stripHtml(from).result

    try {
        const message = { to, text, type, from, time: dayjs().format('HH:mm:ss') }

        await mongoClient.connect()
        const db = mongoClient.db('batepapo_uol')
        const participantFounded = await db.collection('participants').findOne({ name: from })

        if(participantFounded === null) {
            return res.status(422).send('name not found in participants list')
        }

        await messagesSchema.validateAsync(message, { abortEarly: false })
        await db.collection('messages').insertOne(message)

        res.sendStatus(201)
    } catch (err) {
        res.status(422).send(err)
    }
}

export const messagesGET = async (req, res) => {
    const limit = Number(req.query.limit)
    const user = req.headers.user

    await mongoClient.connect()
    const db = mongoClient.db('batepapo_uol')

    const messages = await db.collection('messages').find().sort({ _id: -1 }).limit(limit).toArray()
    const userMessages = messages.filter(messages => messages.to === 'Todos' || messages.to === user || messages.from === user)

    res.send(userMessages.reverse())
}

async function foundMessage(res, db, id, user, method, message) {
    const messageFounded = await db.collection('messages').findOne({ _id: ObjectId(id) })

    if(messageFounded === null) {
        return res.sendStatus(404)
    } else if(messageFounded !== null && messageFounded.from !== user) {
        return res.sendStatus(401)
    } else {
        if(method === 'update') {
            await db.collection('messages').updateOne({ _id: ObjectId(id) }, { $set: message })
            return res.sendStatus(200)
        } 
        if(method === 'delete') {
            await db.collection('messages').deleteOne({ _id: ObjectId(id) })
            return res.sendStatus(200)
        }
    }
}

export const messagesDELETE = async (req, res) => {
    const user = req.headers.user
    const id = req.params.id

    await mongoClient.connect()
    const db = mongoClient.db('batepapo_uol')

    foundMessage(res, db, id, user, 'delete')
}

export const messagesPUT = async (req, res) => {
    const { to, text, type } = req.body
    const from = req.headers.user
    const id = req.params.id

    try {
        const message = { to, text, type, from, time: dayjs().format('HH:mm:ss') }

        await mongoClient.connect()
        const db = mongoClient.db('batepapo_uol')
        const participantFounded = await db.collection('participants').findOne({ name: from })

        if(participantFounded === null) {
            return res.status(422).send('name not found in participants list')
        }

        await messagesSchema.validateAsync(message, { abortEarly: false })
        foundMessage(res, db, id, from, 'update', message)      
    } catch (err) {
        res.status(422).send(err)
    }
}