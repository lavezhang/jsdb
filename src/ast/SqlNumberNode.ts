///<reference path="SqlNode.ts"/>
/**
 * number节点。
 */
class SqlNumberNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlNumberNode(null, null, null);
    }

    public typeDeriva(ctx: SqlContext): SqlColumnType {
        return SqlColumnType.number;
    }

    public compute(ctx: SqlContext): any {
        return this.value.indexOf('.') >= 0 ? parseFloat(this.value) : parseInt(this.value);
    }
}