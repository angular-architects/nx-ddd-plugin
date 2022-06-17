import { tsquery } from '@phenomnomnominal/tsquery';

export function findArrayLiteral(code: string, propName: string): number {
    const ast = tsquery.ast(code);
    const nodes = tsquery(ast, `PropertyAssignment[name.escapedText=${propName}] ArrayLiteralExpression`);
    if (nodes.length === 0) {
        return -1;
    }
    const node = nodes[0];
    const bracket = code.indexOf('[', node.pos);
    return bracket+1;
}