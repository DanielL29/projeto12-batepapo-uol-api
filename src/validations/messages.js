import Joi from 'joi'

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
        .required(),
    time: Joi.string()
        .min(1)
        .required()
})