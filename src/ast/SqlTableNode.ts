///<reference path="SqlNode.ts"/>
/**
 * table节点。
 */
class SqlTableNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlTableNode(null, null, null);
    }

    public toSql(): string {
        let buf = this.nodes[0].toSql();
        if (this.value) {
            buf += ' ' + this.value;
        }
        return buf;
    }

}