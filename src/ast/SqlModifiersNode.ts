///<reference path="SqlNode.ts"/>
/**
 * 修饰符节点（distinct）。
 */
class SqlModifiersNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlModifiersNode(null, null, null);
    }

    public toSql(): string {
        if (this.nodes.length == 0) {
            return '';
        }
        let buf = '';
        for (let i = 0; i < this.nodes.length; i++) {
            buf += this.nodes[i].toSql();
            if (i < this.nodes.length - 1) {
                buf += this.value;
            }
        }
        return buf;
    }

}