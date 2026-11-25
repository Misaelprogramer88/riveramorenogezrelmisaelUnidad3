import { body, param } from 'express-validator';

export const createProductValidator = [
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('El código SKU es obligatorio.')
    .isLength({ min: 3, max: 30 })
    .withMessage('El SKU debe tener entre 3 y 30 caracteres.')
    .matches(/^[A-Za-z0-9\-_]+$/)
    .withMessage('El SKU solo puede contener letras, números, guiones y guion bajo.'),
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre de la terminal es obligatorio.')
    .isLength({ min: 3, max: 120 })
    .withMessage('El nombre debe tener entre 3 y 120 caracteres.')
    .escape(),
  body('modelo')
    .trim()
    .notEmpty()
    .withMessage('El modelo es obligatorio.')
    .isLength({ min: 2, max: 80 })
    .withMessage('El modelo debe tener entre 2 y 80 caracteres.')
    .escape(),
  body('marca')
    .trim()
    .notEmpty()
    .withMessage('La marca es obligatoria.')
    .isLength({ min: 2, max: 60 })
    .withMessage('La marca debe tener entre 2 y 60 caracteres.')
    .escape(),
  body('categoria')
    .trim()
    .notEmpty()
    .withMessage('La categoría es obligatoria.')
    .isLength({ min: 2, max: 60 })
    .withMessage('La categoría debe tener entre 2 y 60 caracteres.')
    .escape(),
  body('precioMxn')
    .notEmpty()
    .withMessage('El precio en MXN es obligatorio.')
    .isFloat({ min: 1, max: 1000000 })
    .withMessage('El precio debe ser un número mayor a 0.'),
  body('stock')
    .notEmpty()
    .withMessage('El stock inicial es obligatorio.')
    .isInt({ min: 0, max: 100000 })
    .withMessage('El stock debe ser un número entero mayor o igual a 0.'),
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede superar los 500 caracteres.')
    .escape()
];

export const updateProductValidator = [
  param('id').trim().notEmpty().withMessage('El ID del producto es obligatorio.'),
  body('sku')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('El SKU debe tener entre 3 y 30 caracteres.')
    .matches(/^[A-Za-z0-9\-_]+$/)
    .withMessage('El SKU solo puede contener letras, números, guiones y guion bajo.'),
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage('El nombre debe tener entre 3 y 120 caracteres.')
    .escape(),
  body('modelo')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('El modelo debe tener entre 2 y 80 caracteres.')
    .escape(),
  body('marca')
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('La marca debe tener entre 2 y 60 caracteres.')
    .escape(),
  body('categoria')
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('La categoría debe tener entre 2 y 60 caracteres.')
    .escape(),
  body('precioMxn')
    .optional()
    .isFloat({ min: 1, max: 1000000 })
    .withMessage('El precio debe ser un número mayor a 0.'),
  body('stock')
    .optional()
    .isInt({ min: 0, max: 100000 })
    .withMessage('El stock debe ser un entero mayor o igual a 0.'),
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede superar los 500 caracteres.')
    .escape()
];
