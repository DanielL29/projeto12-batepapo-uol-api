import Joi from 'joi'

export const messagesSchema = Joi.object({
    to: Joi.string()
        .min(1)
        .trim()
        .required(),
    text: Joi.string()
        .min(1)
        .trim()
        .required(),
    type: Joi.string()
        .valid('private_message', 'message')
        .trim()
        .required(),
    from: Joi.string()
        .min(1)
        .trim()
        .required(),
    time: Joi.string()
        .min(1)
        .trim()
        .required()
})