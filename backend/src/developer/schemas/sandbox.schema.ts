import Joi from 'joi';

export const challengeSchema = Joi.object({
  polkadotAddress: Joi.string()
    .pattern(/^[1-9A-HJ-NP-Za-km-z]{47,48}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid Polkadot address format',
      'any.required': 'Polkadot address is required',
    }),
});

export const authenticateSchema = Joi.object({
  polkadotAddress: Joi.string()
    .pattern(/^[1-9A-HJ-NP-Za-km-z]{47,48}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid Polkadot address format',
      'any.required': 'Polkadot address is required',
    }),
  signature: Joi.string().required().messages({
    'any.required': 'Signature is required',
  }),
  message: Joi.string().required().messages({
    'any.required': 'Message is required',
  }),
  // contactEmail is optional for existing users (they already have email stored)
  // Required only for new user registration
  contactEmail: Joi.string().email().lowercase().allow('').optional().messages({
    'string.email': 'Must be a valid email address',
  }),
});

export const regenerateKeySchema = Joi.object({
  polkadotAddress: Joi.string()
    .pattern(/^[1-9A-HJ-NP-Za-km-z]{47,48}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid Polkadot address format',
      'any.required': 'Polkadot address is required',
    }),
  signature: Joi.string().required().messages({
    'any.required': 'Signature is required',
  }),
  message: Joi.string().required().messages({
    'any.required': 'Message is required',
  }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required',
  }),
});
