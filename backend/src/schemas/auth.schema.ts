// src/schemas/auth.schema.ts

import Joi from 'joi';
import { addressValidator } from '~/utils';


// POST /auth/challenge
export const challengeSchema = Joi.object({
  address: Joi.string()
    .required()
    .custom(addressValidator, 'Polkadot SS58 address validation')
    .messages({
      'any.required': 'Address is required',
      'any.invalid':  'Invalid Polkadot address',
      'string.base':  'Address must be text'
    }),
});

// POST /auth/polkadot
export const polkadotLoginSchema = Joi.object({
  address: Joi.string()
    .required()
    .messages({
      'string.empty': 'Address is required',
      'any.required': 'Address is required',
    }),
  message: Joi.string()
    .required()
    .messages({
      'string.empty': 'Message is required',
      'any.required': 'Message is required',
    }),
  signature: Joi.string()
    .required()
    .messages({
      'string.empty': 'Signature is required',
      'any.required': 'Signature is required',
    }),
});
