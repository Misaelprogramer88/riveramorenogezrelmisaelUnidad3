import { body, param } from 'express-validator';

export const createQuoteValidator = [
  body('cliente')
    .trim()
    .notEmpty()
    .withMessage('El nombre del cliente es obligatorio.')
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre del cliente debe tener entre 3 y 100 caracteres.')
    .escape(),
  body('empresa')
    .trim()
    .notEmpty()
    .withMessage('El nombre de la empresa es obligatorio.')
    .isLength({ min: 2, max: 120 })
    .withMessage('La empresa debe tener entre 2 y 120 caracteres.')
    .escape(),
  body('emailCliente')
    .trim()
    .notEmpty()
    .withMessage('El correo del cliente es obligatorio.')
    .isEmail()
    .withMessage('Formato de correo del cliente inválido.')
    .normalizeEmail(),
  body('items')
    .isArray({ min: 1 })
    .withMessage('La cotización debe incluir al menos una terminal POS.'),
  body('items.*.productId')
    .trim()
    .notEmpty()
    .withMessage('Cada partida debe especificar un productId válido.'),
  body('items.*.cantidad')
    .isInt({ min: 1, max: 1000 })
    .withMessage('La cantidad de cada terminal debe ser un entero entre 1 y 1000.'),
  body('notas')
    .optional()
    .trim()
    .isLength({ max: 400 })
    .withMessage('Las notas no pueden superar 400 caracteres.')
    .escape()
];

export const updateQuoteStatusValidator = [
  param('id').trim().notEmpty().withMessage('El ID de la cotización es obligatorio.'),
  body('estado')
    .trim()
    .toUpperCase()
    .isIn(['BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA'])
    .withMessage('Estado no válido. Use: BORRADOR, ENVIADA, APROBADA o RECHAZADA.')
];
