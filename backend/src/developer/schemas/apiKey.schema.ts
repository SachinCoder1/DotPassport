import Joi from 'joi';
import { ApiKeyTier } from '../models/ApiKey';

export const createApiKeySchema = Joi.object({
  appName: Joi.string().trim().min(3).max(100).required().messages({
    'string.min': 'App name must be at least 3 characters',
    'string.max': 'App name must be at most 100 characters',
    'any.required': 'App name is required',
  }),
  contactEmail: Joi.string().trim().email().lowercase().required().messages({
    'string.email': 'Must be a valid email address',
    'any.required': 'Contact email is required',
  }),
  tier: Joi.string()
    .valid(...Object.values(ApiKeyTier))
    .required()
    .messages({
      'any.only': `Tier must be one of: ${Object.values(ApiKeyTier).join(', ')}`,
      'any.required': 'Tier is required',
    }),
  allowedOrigins: Joi.array().items(Joi.string().uri()).optional().messages({
    'string.uri': 'Each origin must be a valid URI',
  }),
  metadata: Joi.object().optional(),
});

export const updateApiKeySchema = Joi.object({
  appName: Joi.string().trim().min(3).max(100).optional(),
  contactEmail: Joi.string().trim().email().lowercase().optional(),
  tier: Joi.string()
    .valid(...Object.values(ApiKeyTier))
    .optional(),
  allowedOrigins: Joi.array().items(Joi.string().uri()).optional(),
  isActive: Joi.boolean().optional(),
  metadata: Joi.object().optional(),
}).min(1); // At least one field must be provided

export const revokeApiKeySchema = Joi.object({
  reason: Joi.string().max(500).optional(),
});
