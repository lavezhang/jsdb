///<reference path="SqlNode.ts"/>
/**
 * join节点。
 */
class SqlJoinNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlJoinNode(null, null, null);
    }

    public toSql(): string {
        return this.value + ' ' + this.nodes[0].toSql() + ' on ' + this.nodes[1].toSql();
    }
}