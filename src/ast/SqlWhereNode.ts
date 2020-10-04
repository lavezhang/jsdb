///<reference path="SqlNode.ts"/>
/**
 * where节点。
 */
class SqlWhereNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlWhereNode(null, null, null);
    }

    public compute(ctx: SqlContext): any {
        return this.nodes[0].compute(ctx);
    }
}