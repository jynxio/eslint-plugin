import { RuleTester } from 'eslint';
import path from 'node:path';
import plugin from './index';

type TestCase = {
    callerPath: string;
    importPath: string;
    isError?: boolean;
    pathAlias?: Record<string, string>;
};

const pathAlias = {
    '$': path.resolve('./'),
    '@': path.resolve('./src'),
};

const testCases = [
    // Third-party library imports
    { callerPath: 'src/app/page.tsx', importPath: 'third-party' },
    { callerPath: 'src/app/page.tsx', importPath: '_third-party' },
    { callerPath: 'src/app/page.tsx', importPath: 'third-party/sub' },
    { callerPath: 'src/app/page.tsx', importPath: 'third-party/_sub' },

    // Relative path imports
    { callerPath: 'src/app/page.tsx', importPath: './file.js' },
    { callerPath: 'src/app/page.tsx', importPath: './_file.js' },
    { callerPath: 'src/app/page.tsx', importPath: './dir/file.js' },
    { callerPath: 'src/app/page.tsx', importPath: './dir/_file.js', isError: true },
    { callerPath: 'src/app/page.tsx', importPath: './_dir/file.js' },
    { callerPath: 'src/app/page.tsx', importPath: './_dir/_file.js', isError: true },
    { callerPath: 'src/app/page.tsx', importPath: '../file.js' },
    { callerPath: 'src/app/page.tsx', importPath: '../_file.js' },
    { callerPath: 'src/app/page.tsx', importPath: '../dir/file.js' },
    { callerPath: 'src/app/page.tsx', importPath: '../dir/_file.js', isError: true },
    { callerPath: 'src/app/page.tsx', importPath: '../_dir/file.js' },
    { callerPath: 'src/app/page.tsx', importPath: '../_dir/_file.js', isError: true },

    // Folders as modules
    { callerPath: 'src/app/page.tsx', importPath: './dir' },
    { callerPath: 'src/app/page.tsx', importPath: './_dir' },
    { callerPath: 'src/app/page.tsx', importPath: './dir/index' },
    { callerPath: 'src/app/page.tsx', importPath: './dir/index.js' },
    { callerPath: 'src/app/page.tsx', importPath: './_dir/index' },
    { callerPath: 'src/app/page.tsx', importPath: './_dir/index.js' },

    // Paths outside project root
    { callerPath: 'src/app/page.tsx', importPath: '../../../../file.js' },
    { callerPath: 'src/app/page.tsx', importPath: '../../../../_file.js' },

    // Path alias imports
    { callerPath: 'src/app/page.tsx', importPath: '@/app/_file.js', pathAlias },
    { callerPath: 'src/app/page.tsx', importPath: '@/dir/_file.js', isError: true, pathAlias },
    { callerPath: 'src/app/page.tsx', importPath: '$/src/app/_file.js', pathAlias },
    { callerPath: 'src/app/page.tsx', importPath: '$/src/dir/_file.js', isError: true, pathAlias },
] as const satisfies TestCase[];

const underscoreFilePattern = plugin.rules['underscore-file-pattern'];
const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
});

ruleTester.run('underscore-file-pattern', underscoreFilePattern, {
    valid: createValidTestCases(testCases),
    invalid: createInvalidTestCases(testCases),
});

function createValidTestCases(i: TestCase[]): RuleTester.ValidTestCase[] {
    return i
        .filter(item => !item.isError)
        .map(item => {
            const filename = item.callerPath;
            const importDeclaration = `import '${item.importPath}';`;
            const importExpression = `import ('${item.importPath}');`;
            const code = importDeclaration + '\n' + importExpression;
            const options = [item.pathAlias || {}];

            return { filename, code, options };
        });
}

function createInvalidTestCases(i: TestCase[]): RuleTester.InvalidTestCase[] {
    return i
        .filter(item => item.isError)
        .map(item => {
            const filename = item.callerPath;
            const importDeclaration = `import '${item.importPath}';`;
            const importExpression = `import ('${item.importPath}');`;
            const code = importDeclaration + '\n' + importExpression;
            const options = [item.pathAlias || {}];
            const errors = [
                { messageId: 'underscore-file-pattern' },
                { messageId: 'underscore-file-pattern' },
            ];

            return { filename, code, options, errors };
        });
}
