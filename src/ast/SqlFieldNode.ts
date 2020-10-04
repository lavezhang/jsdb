///<reference path="SqlNode.ts"/>
/**
 * field节点。
 */
class SqlFieldNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlFieldNode(null, null, null);
    }

    public toSql(): string {
        let buf = this.nodes[0].toSql();
        if (this.value) {
            buf += ' as ' + this.value;
        }
        return buf;
    }

    public typeDeriva(ctx: SqlContext): SqlColumnType {
        return this.nodes[0].typeDeriva(ctx);
    }

    public compute(ctx: SqlContext): any {
        return this.nodes[0].compute(ctx);
    }
}