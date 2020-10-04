///<reference path="SqlNode.ts"/>
/**
 * limit节点。
 */
class SqlLimitNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlLimitNode(null, null, null);
    }

    public toSql(): string {
        if (this.nodes.length == 2) {
            return this.value + ' ' + this.nodes[0].toSql() + ', ' + this.nodes[1].toSql();
        }
        return super.toSql();
    }
}