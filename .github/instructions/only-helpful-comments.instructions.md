---
applyTo: "**/*.ts"
---

# Only helpful comments

This rule applies to JSDoc strings that appear above functions, classes, and other symbols in TypeScript files. It does not apply to inline comments or comments that are not in JSDoc format.

- Comments that document functions and so forth should only be present if it is not clear from context or names what the function does. For example, a function called 'getFirstName' should not have a docstring "Returns the first name", because that is not helpful.
- JSDoc strings should never describe the input parameters or function return values. They should only exist to describe the symbol if its purpose and usage is not apparent from its name and arguments.
- AI agents should only generate JSDoc strings that are helpful and conform to the above rules.
