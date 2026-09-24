# Forge AI Response Actions

## Outcome

The real contextual Forge AI response in the coding workspace provides the
next learning actions from the product brief instead of forcing the learner to
rewrite each follow-up prompt manually.

## Requirements

- Keep the active code, error, challenge, hint level, and explicit sharing
  choice in every follow-up request.
- Make Explain simpler, Go deeper, Give example, Quiz me, and Practice this
  submit real Workers AI follow-up requests.
- Open the related lesson through application navigation.
- Allow the learner to copy or regenerate the current response.
- Allow an in-flight browser request to be stopped with `AbortController` and
  abort requests when the workspace unmounts.
- Preserve authenticated rate limits, bounded context, usage logging, and
  server-side prompt policy.

## Verification

- The authenticated production lifecycle waits for a real Workers AI response
  and verifies all eight response controls.
- TypeScript, ESLint, unit/API tests, build, bundle budgets, and browser
  regression remain release gates.
