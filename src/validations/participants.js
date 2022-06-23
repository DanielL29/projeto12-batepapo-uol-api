import Joi from "joi";

export const participantSchema = Joi.object({
    name: Joi.string()
        .min(1)
        .required(),
    lastStatus: Joi.number()
        .min(10)
        .required()
})