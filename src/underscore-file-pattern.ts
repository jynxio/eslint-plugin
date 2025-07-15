import type { Rule } from 'eslint';
import type { ImportDeclaration, ImportExpression } from 'estree';

import path from 'node:path';

const underscoreFilePattern: Rule.RuleModule = {
    meta: {
        type: 'problem',
        docs: { recommended: true },
        messages: {
            'underscore-file-pattern': 'This file does not have permission to import this module',
        },
        schema: [
            {
                type: 'object',
                description: 'Path aliases (use absolute paths)',
                additionalProperties: false,
                patternProperties: {
                    '^.+$': {
                        type: 'string',
                        description: 'The absolute path for the alias key.',
                    },
                },
            },
        ],
    },

    create(context) {
        return {
            ImportExpression: node => void lintImportStatement({ node, ctx: context }),
            ImportDeclaration: node => void lintImportStatement({ node, ctx: context }),
        };
    },
};

function lintImportStatement({
    ctx,
    node,
}: {
    ctx: Rule.RuleContext;
    node: ImportDeclaration | ImportExpression;
}) {
    const absoluteCallerPath = path.resolve(ctx.filename);
    const absoluteModulePath = getAbsoluteModulePath(ctx, node);

    if (absoluteModulePath === undefined) return;

    const hasPermission = checkPermission(absoluteCallerPath, absoluteModulePath);

    if (hasPermission) return;

    ctx.report({ node: node.source, messageId: 'underscore-file-pattern' });
}

function getImportPath({ type, source }: ImportDeclaration | ImportExpression) {
    // ImportDeclaration
    if (type === 'ImportDeclaration') {
        const value = source.value;

        return typeof value === 'string' ? value : undefined;
    }

    // ImportExpression
    if (source.type !== 'Literal') return;
    if (typeof source.value !== 'string') return;

    return source.value;
}

function getAbsoluteModulePath(ctx: Rule.RuleContext, node: ImportDeclaration | ImportExpression) {
    const importPathStr = getImportPath(node);

    if (importPathStr === undefined) return;
    if (importPathStr === '') return;

    const pathnames = importPathStr.split(path.sep);
    const firstPathname = pathnames[0];

    if (firstPathname === undefined) return;

    const param = ctx.options[0];
    const isPathAlias = checkPathAlias(param);
    const pathAlias = isPathAlias ? param : {};
    const validPrefix = new Set(['', '.', '..', ...Object.keys(pathAlias)]);

    if (!validPrefix.has(firstPathname)) return;

    const alias = pathAlias[firstPathname];

    if (alias !== undefined) return path.join(...pathnames.toSpliced(0, 1, alias));

    const absoluteCallerPath = path.resolve(ctx.filename);
    const dirpath = path.dirname(absoluteCallerPath);
    const absoluteModulePath = path.resolve(dirpath, importPathStr);

    return absoluteModulePath;
}

function checkPermission(absoluteCallerPath: string, absoluteModulePath: string) {
    const privateFilepath = (function f(i: string) {
        const parsedPath = path.parse(i);

        if (parsedPath.dir === parsedPath.root) return i; // Reached root directory
        if (parsedPath.base.startsWith('_')) return i; // Found private file

        return f(parsedPath.dir);
    })(absoluteModulePath);
    const privateDirpath = path.dirname(privateFilepath);
    const relativePath = path.relative(privateDirpath, absoluteCallerPath);
    const isInSameDir = !relativePath.startsWith('..');

    return isInSameDir;
}

function checkPathAlias(i: unknown): i is Record<string, string> {
    if (i === null) return false;
    if (typeof i !== 'object') return false;

    for (const item of Object.values(i)) if (typeof item !== 'string') return false;

    return true;
}

export { underscoreFilePattern };
