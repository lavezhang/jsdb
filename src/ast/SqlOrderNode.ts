///<reference path="SqlNode.ts"/>
/**
 * order节点。
 */
class SqlOrderNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlOrderNode(null, null, null);
    }

    public toSql(): string {
        let buf = this.nodes[0].toSql();
        if (this.value) {
            buf += ' ' + this.value;
        }
        return buf;
    }
}