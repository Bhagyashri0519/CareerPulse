import { body } from 'express-validator';

export const updateProfileValidation = [
  body('year')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Year must be an integer between 1 and 5'),
  body('cgpa')
    .optional({ nullable: true })
    .isFloat({ min: 0.0, max: 10.0 })
    .withMessage('CGPA must be a number between 0.0 and 10.0'),
  body('weeklyLearningHours')
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage('Weekly learning hours must be between 1 and 60'),
  body('bio')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('degree')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Degree cannot be empty'),
  body('branch')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Branch cannot be empty'),
  body('targetRoleId')
    .optional({ nullable: true })
    .isString()
    .trim(),
];

export const updateSkillsValidation = [
  body('skills')
    .isArray({ min: 1 })
    .withMessage('Skills must be a non-empty array'),
  body('skills.*.canonicalId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Each skill must have a canonicalId'),
  body('skills.*.level')
    .isInt({ min: 0, max: 100 })
    .withMessage('Skill level must be an integer between 0 and 100'),
  body('skills.*.name')
    .optional()
    .isString()
    .trim(),
  body('skills.*.category')
    .optional()
    .isString()
    .trim(),
];
