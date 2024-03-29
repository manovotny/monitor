module.exports = {
    extends: 'get-off-my-lawn',
    ignorePatterns: ['.next', 'reference', 'thunder-tests'],
    rules: {
        // Fixed in next version of GOML
        '@typescript-eslint/no-floating-promises': 'off',
        // https://github.com/vercel/next.js/discussions/29403#discussioncomment-1908563
        // https://github.com/facebook/react/issues/16873#issuecomment-536346885
        'react-hooks/exhaustive-deps': 'off',
    },
};
