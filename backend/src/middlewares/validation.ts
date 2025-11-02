import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return next(new AppError(`Dados inválidos: ${errorMessages.join(', ')}`, 400));
    }

    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.params);

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return next(new AppError(`Parâmetros inválidos: ${errorMessages.join(', ')}`, 400));
    }

    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.query);

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return next(new AppError(`Query parameters inválidos: ${errorMessages.join(', ')}`, 400));
    }

    next();
  };
};