import express from 'express'
import cors from 'cors'
import dayjs from 'dayjs'
import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
import { participantSchema } from './validations/participants.js'

const app = express()
app.use(express.json())
app.use(cors())
dotenv.config()

let db;
const mongoClient = new MongoClient(process.env.MONGO_URL)
const connect = mongoClient.connect()
connect.then(() => db = mongoClient.db('batepapo_uol'))

app.post('/participants', async (req, res) => {
    const { name } = req.body
    const participants = await db.collection('participants').find().toArray()
    const nameFounded = participants.some(participant => participant.name === name)
    let validateParticipant;

    if(nameFounded) return res.sendStatus(409)

    try {
        const participant = { name, lastStatus: Date.now() }
        const statusMessage = {
            from: name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: dayjs().format('HH:mm:ss')
        }
        validateParticipant = await participantSchema.validateAsync(participant)

        await db.collection('participants').insertOne(participant)
        await db.collection('messages').insertOne(statusMessage)

        res.sendStatus(201)
    } catch(err) {
        res.status(422).send(err)
    }
})

app.listen(process.env.PORT, () => console.log(`Servidor rodando na porta ${process.env.PORT}...`))