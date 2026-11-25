import { body } from 'express-validator';

export const registerValidator = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre completo es obligatorio.')
    .isLength({ min: 3, max: 80 })
    .withMessage('El nombre debe tener entre 3 y 80 caracteres.')
    .escape(),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El correo electrónico es obligatorio.')
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria.')
    .isLength({ min: 6, max: 64 })
    .withMessage('La contraseña debe tener al menos 6 caracteres.'),
  body('role')
    .optional()
    .trim()
    .toUpperCase()
    .isIn(['ADMIN', 'VENDEDOR'])
    .withMessage('El rol debe ser ADMIN o VENDEDOR.'),
  body('departamento')
    .optional()
    .trim()
    .isLength({ max: 80 })
    .withMessage('El departamento no debe exceder 80 caracteres.')
    .escape()
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El correo electrónico es obligatorio.')
    .isEmail()
    .withMessage('Formato de correo electrónico inválido.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria.')
];
