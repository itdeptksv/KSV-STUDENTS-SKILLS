Fix the exact Vite OXC parsing error in the existing file:

`client/src/pages/teachers/ClassTeacherDashboard.jsx`

Error location: Line 95, Column 15.

Current malformed code:
`setCompName] = useState('');`

Requirements:

1. Inspect the complete component around lines 85–105.
2. Identify the intended React useState declaration for `compName`.
3. Restore the correct declaration syntax, including the missing `const` and opening destructuring bracket if required.
4. Check nearby state declarations for similar accidental truncation or syntax errors.
5. Preserve the existing state variables, component logic, UI, and functionality.
6. Do not delete Competition Record functionality or unrelated code while fixing this syntax error.
7. Do not rewrite the entire component or redesign the dashboard.
8. Fix the actual source code error. Do not disable Vite's error overlay or hide the error.

Make only the necessary corrections in the existing file.
