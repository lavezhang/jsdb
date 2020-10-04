///<reference path="SqlNode.ts"/>
/**
 * having节点。
 */
class SqlHavingNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlHavingNode(null, null, null);
    }

    public compute(ctx: SqlContext): any {
        return this.nodes[0].compute(ctx);
    }
}