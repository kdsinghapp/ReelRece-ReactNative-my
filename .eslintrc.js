module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // TypeScript: Prevent new 'any' types from being added
    '@typescript-eslint/no-explicit-any': 'warn', // Warns on explicit 'any ' usage
    '@typescript-eslint/no-unsafe-assignment': 'off', // Keep off initially to avoid overwhelming errors
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    
    // Consider enabling these rules after significant progress:
    // '@typescript-eslint/no-explicit-any': 'error', // Escalate to error once count is low
    // '@typescript-eslint/explicit-function-return-type': 'warn', // Enforce return types
  },
};
