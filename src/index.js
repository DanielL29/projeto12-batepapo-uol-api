import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import chalk from 'chalk'
import { participantsPOST, participantsGET, participantStatusPOST } from './api/participants.js'
import { messagesGET, messagesPOST, messagesDELETE, messagesPUT } from './api/messages.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())

app.post('/participants', (req, res) => participantsPOST(req, res))
app.get('/participants', (_, res) => participantsGET(_, res))
app.post('/messages', (req, res) => messagesPOST(req, res))
app.get('/messages', (req, res) => messagesGET(req, res))
app.post('/status', (req, res) => participantStatusPOST(req, res))
app.delete('/messages/:id', (req, res) => messagesDELETE(req, res))
app.put('/messages/:id', (req, res) => messagesPUT(req, res))

app.listen(process.env.PORT, () => console.log(
    chalk.blue(`Servidor rodando na porta ${chalk.bold.white(process.env.PORT)}...`)
))