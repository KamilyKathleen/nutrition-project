/**
 * 🔧 MIDDLEWARE DE VALIDAÇÃO - EXPRESS VALIDATOR
 * ===============================================
 * Middleware para validação de requisições usando express-validator
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from './errorHandler';

/**
 * 🔍 Middleware para processar resultados de validação
 * Verifica se há erros de validação e retorna erro formatado
 */
export const validateRequest = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  // Extrai resultados da validação
  const errors = validationResult(req);

  // Se não há erros, continua
  if (errors.isEmpty()) {
    return next();
  }

  // Formata erros para resposta
  const errorMessages = errors.array().map(error => ({
    field: error.type === 'field' ? (error as any).path : 'unknown',
    message: error.msg,
    value: error.type === 'field' ? (error as any).value : undefined
  }));

  // Monta mensagem de erro
  const errorMessage = errorMessages
    .map(err => `${err.field}: ${err.message}`)
    .join(', ');

  // Retorna erro de validação
  return next(new AppError(
    `Dados de entrada inválidos: ${errorMessage}`,
    400
  ));
};

/**
 * 🔍 Middleware específico para validação de parâmetros
 */
export const validateParams = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const errorMessages = errors.array()
    .filter(error => error.type === 'field' && (error as any).location === 'params')
    .map(error => ({
      field: (error as any).path,
      message: error.msg,
      value: (error as any).value
    }));

  if (errorMessages.length === 0) {
    return next();
  }

  const errorMessage = errorMessages
    .map(err => `${err.field}: ${err.message}`)
    .join(', ');

  return next(new AppError(
    `Parâmetros inválidos: ${errorMessage}`,
    400
  ));
};

/**
 * 🔍 Middleware específico para validação de query parameters
 */
export const validateQueryParams = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const errorMessages = errors.array()
    .filter(error => error.type === 'field' && (error as any).location === 'query')
    .map(error => ({
      field: (error as any).path,
      message: error.msg,
      value: (error as any).value
    }));

  if (errorMessages.length === 0) {
    return next();
  }

  const errorMessage = errorMessages
    .map(err => `${err.field}: ${err.message}`)
    .join(', ');

  return next(new AppError(
    `Query parameters inválidos: ${errorMessage}`,
    400
  ));
};