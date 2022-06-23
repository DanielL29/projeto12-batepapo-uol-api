import Joi from 'joi'
import mongoClient from '../config/db.js'

async function validateNameInParticipants(value, helper) {
    await mongoClient.connect()
    const db = mongoClient.db('batepapo_uol')

    const participants = await db.collection('participants').find().toArray()
    const participantsNames = participants.map(participant => participant.name)

    // resultado incompleto, não o esperado
    if(!participantsNames.includes(value)) {
        throw new Error('this name is not in the participants list')
    } else {
        return true
    }
}

export const messagesSchema = Joi.object({
    to: Joi.string()
        .min(1)
        .required(),
    text: Joi.string()
        .min(1)
        .required(),
    type: Joi.string()
        .valid('private_message', 'message')
        .required(),
    from: Joi.string()
        .min(1)
        .custom(validateNameInParticipants) // enviando erro de forma errada
        .required(),
    time: Joi.string()
        .min(1)
        .required()
})