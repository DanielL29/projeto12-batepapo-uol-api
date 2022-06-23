import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { participantsPOST, participantsGET } from './api/participants.js'
import { messagesGET, messagesPOST } from './api/messages.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())

app.post('/participants', (req, res) => participantsPOST(req, res))
app.get('/participants', (_, res) => participantsGET(_, res))
app.post('/messages', (req, res) => messagesPOST(req, res))
app.get('/messages', (req, res) => messagesGET(req, res))

app.listen(process.env.PORT, () => console.log(`Servidor rodando na porta ${process.env.PORT}...`))