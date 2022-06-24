import mongoClient from '../config/db.js'
import dayjs from 'dayjs'
import { stripHtml } from 'string-strip-html'
import { participantSchema } from '../validations/participants.js'

export const participantsPOST = async (req, res) => {
    let { name } = req.body
    
    await mongoClient.connect()
    const db = mongoClient.db('batepapo_uol')
    
    const participants = await db.collection('participants').find().toArray()
    const nameFounded = participants.some(participant => participant.name === name)
    
    if (nameFounded) return res.sendStatus(409)
    
    try {
        name = stripHtml(name).result
        const participant = { name, lastStatus: Date.now() }
        const statusMessage = {
            from: name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: dayjs().format('HH:mm:ss')
        }

        await participantSchema.validateAsync(participant, { abortEarly: false })
        await db.collection('participants').insertOne(participant)
        await db.collection('messages').insertOne(statusMessage)

        res.sendStatus(201)
    } catch (err) {
        res.status(422).send(err)
    }
}

export const participantsGET = async (_, res) => {
    await mongoClient.connect()
    const db = mongoClient.db('batepapo_uol')

    const participants = await db.collection('participants').find().toArray()

    res.send(participants)
}

export const participantStatusPOST = async (req, res) => {
    const user = req.headers.user

    await mongoClient.connect()
    const db = mongoClient.db('batepapo_uol')

    const participants = await db.collection('participants').find().toArray()
    const hasParticipant = participants.some(participant => participant.name === user)

    if (!hasParticipant) return res.sendStatus(404)

    await db.collection('participants').updateOne({ name: user }, { $set: { lastStatus: Date.now() }})

    res.sendStatus(200)
}

const removingInativeUsers = async () => {
    let amountDeletedMessages = []

    await mongoClient.connect()
    const db = mongoClient.db('batepapo_uol')

    const inativeUsers = await db.collection('participants').find({ lastStatus: { $lt: Date.now() - 10000 } }).toArray()
    const deletedCount = await (await db.collection('participants').deleteMany({ lastStatus: { $lt: Date.now() - 10000 } })).deletedCount

    for(let i = 0; i < deletedCount; i++) {
        amountDeletedMessages.push({
            from: inativeUsers[i].name,
            to: 'Todos',
            text: 'sai da sala...',
            type: 'status',
            time: dayjs().format('HH:mm:ss')
        })
    }
    
    if(amountDeletedMessages.length > 0) {
        await db.collection('messages').insertMany(amountDeletedMessages)
    }
}

setInterval(removingInativeUsers, 15000)