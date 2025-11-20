# Best practices

---

## General Goals

- Sync the UI team with the latest coding standards and address technical debts.
- Encourage contributions and ideas for continuous improvement.
- Aim for **maintainable, scalable, and readable code** while maintaining consistency.

---

## React Best Practices

1.  **File Extensions**

    - **Components**: Use `.tsx` for all components. One component per file. No nested components.
    - **Logic/Utility Files**: Use `.ts` for non-component files containing logic or utilities.

2.  **Component Naming**

    - **Convention**: Use **PascalCase** for all component names (e.g., `HeaderTop.tsx`).

3.  **Folder and File Structure**

    - **Folder Naming**: Use **lowercase, kebab-case** (e.g., `/components/main-header/`).
    - **Component Structure**:
      - `/components/my-component/`
      - `/components/my-component/components/`
      - `/components/my-component/utils/`
      - `/components/my-component/hooks/`

4.  **Styling**

    - Prefer **SCSS** for styling to leverage nesting, variables, and mixins for maintainable styles.
    - Extract styling logic into **SCSS files** (`my-component-name.scss`) rather than embedding styles within components.
    - Use **project-based class names** on components as the anchor for the rules. It is unsafe to rely on patternfly class names as they tend to change between versions.

5.  **Functional Components**

    - **Functional components** are the default. Use class components only for specific lifecycle methods unavailable in functional components (e.g., `componentDidCatch`).

6.  **Logic Separation**

    - Extract as much logic as possible from components into **custom hooks or utility files**. It is much easier to unit test a hook or a utility function.
    - Avoid bloated components by delegating logic to external modules.

7.  **Exports**

    - Use **default exports** for all components.

8.  **Component Testing**

    - Use **Cypress or Playwright** for end-to-end (E2E) testing.
    - Aim for comprehensive test coverage/UI coverage.

9.  **File and Function Length**

    - **File Length**: Keep files under **150 lines** whenever possible.
    - **Function Length**: Functions should focus on a single responsibility and be easily understood.

10. **Performance Optimization**

    - Use React's **memoization tools** (`React.memo`, `useMemo`, `useCallback`) to avoid unnecessary re-renders.
    - **Lazy load components** with `React.lazy` and `Suspense`.

11. **Hooks**
    - **Specify Dependencies**: Always specify dependencies in `useEffect` to avoid unnecessary re-renders or missed updates. If no dependencies are required, pass an **empty array `[]`** to run the effect only once.
    - **Logic in Hooks**: Hooks should contain only logic and side effects, **not return JSX**. Keep the JSX in the components, while hooks should be used for extracting reusable or unit-testable logic (e.g., API calls, data transformation, form handling).

---

## JavaScript and TypeScript Best Practices

1.  **Constants**

    - Define constants in utility files with **uppercase and underscore-separated naming** (e.g., `API_URL`).

2.  **Naming Conventions**

    - Use **descriptive names** for variables, functions, and components. Avoid abbreviations unless widely recognized. Example: Use `fetchUserData` instead of `getData`.

3.  **Functions**

    - Keep functions short and focused on one action.
    - Apply **Red → Green → Refactor**:
      - Write a failing (**red**) solution.
      - Implement a working (**green**) solution.
      - Refactor for readability and performance.

4.  **TypeScript Types**

    - Prefer using `type` instead of `interface` for defining the shapes of objects or functions.
    - If a type is exported, add it to a utility file.
    - **Avoid `any` type**: Always try to avoid using `any` type in TypeScript as it compromises type safety. Use **`unknown`** instead, and narrow the type as needed.
    - Always **explicitly define return types** for functions rather than relying on TypeScript to infer them from the implementation. This helps minimize errors, especially during bug fixes, by preventing unintentional changes to the return value.

5.  **Avoid Magic Numbers**
    - Avoid hardcoded values (**magic numbers**) and define them as **constants** for easy adjustments and readability.

---

## CSS/SCSS Best Practices

1.  **Styling Guidelines**

    - Prefer **SCSS** for styling to utilize features like nesting, variables, and mixins.
    - Extract styling into **separate files** for better organization.

2.  **General Principles**

    - Follow the **BEM methodology** for consistent and predictable class naming.
    - Use **responsive design principles**: Relative units (%, em, rem) over absolute units (px).

3.  **Avoid \!important**
    - **Do not use \!important** in your SCSS unless absolutely necessary, as it makes the code harder to maintain and debug.

---

## Code Quality and Maintainability

1.  **Comments**

    - Avoid comments whenever possible; write **self-explanatory code**.
    - Use comments sparingly for unusual values or decisions, and explain the rationale.

2.  **Global/Store State**

    - Keep the **global state minimal** and straightforward.
    - Obtain **approval in the PR** to add new values to prevent bloating.

3.  **Avoid Circular Dependencies**

    - Use index files cautiously. Avoid situations that can lead to **circular dependencies**.

4.  **Collaboration and Documentation**

    - Encourage clear communication and documentation of guidelines.

5.  **Linting and Formatting**
    - Use **ESLint** (with React and TypeScript plugins) and **Prettier** for consistent formatting and linting.
    - Use **[Husky](https://typicode.github.io/husky/)** to run linters before commits - don’t skip it. The **[lint-staged](https://github.com/lint-staged/lint-staged)** package makes this easy and configurable.

---

## Code Reviews and Version Control

1.  **Code Review**

    - Encourage **peer code reviews** to ensure consistency, catch errors, and improve code quality.
    - **No merges without a review**.

2.  **Version Control**
    - Use **meaningful commit messages** and avoid committing broken code.
    - Always **commit often** to ensure proper tracking of changes - can be squashed.
    - Try to use **smaller, dedicated PRs** instead of one extensive PR. This will facilitate the review process, QE verification, and tracking changes.
    - Add a main PR comment that explains the referenced links, Jira, doc, use cases, and current/required state. When there are visual changes, add videos and/or screenshots (Use PR template).

---

## PR Template:

```markdown
## 📝 Description

> Add a brief description

## 🔗 Links

> Add JIRA, Docs, and other PR/Issue links

## 👥 CC://

> @tag as needed

## 📹 Demo

> Please add a video or an image of the behavior/changes, preferably before and
```
