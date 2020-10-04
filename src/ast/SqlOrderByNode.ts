///<reference path="SqlNode.ts"/>
/**
 * order by节点。
 */
class SqlOrderByNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlOrderByNode(null, null, null);
    }

    public toSql(): string {
        let buf = this.value + ' ';
        for (let i = 0; i < this.nodes.length; i++) {
            buf += this.nodes[i].toSql();
            if (i < this.nodes.length - 1) {
                buf += ', ';
            }
        }
        return buf;
    }
}