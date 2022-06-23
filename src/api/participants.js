import mongoClient from '../config/db.js'
import dayjs from 'dayjs'
import { participantSchema } from '../validations/participants.js'

export const participantsPOST = async (req, res) => {
    const { name } = req.body

    await mongoClient.connect()
    const db = mongoClient.db('batepapo_uol')

    const participants = await db.collection('participants').find().toArray()
    const nameFounded = participants.some(participant => participant.name === name)

    if (nameFounded) return res.sendStatus(409)

    try {
        const participant = { name, lastStatus: Date.now() }
        const statusMessage = {
            from: name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: dayjs().format('HH:mm:ss')
        }
        
        await participantSchema.validateAsync(participant)
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