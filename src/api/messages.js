import mongoClient from '../config/db.js'
import dayjs from 'dayjs'
import { messagesSchema } from '../validations/messages.js'

export const messagesPOST = async (req, res) => {
    const { to, text, type } = req.body
    const from = req.headers.user

    try {
        const message = { to, text, type, from, time: dayjs().format('HH:mm:ss') }

        await mongoClient.connect()
        const db = mongoClient.db('batepapo_uol')


        await messagesSchema.validateAsync(message)
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