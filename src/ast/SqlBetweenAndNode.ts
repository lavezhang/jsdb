///<reference path="SqlNode.ts"/>
/**
 * between and节点。
 */
class SqlBetweenAndNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlBetweenAndNode(null, null, null);
    }

    public toSql(): string {
        return this.nodes[0].toSql() + ' and ' + this.nodes[1].toSql();
    }

    public compute(ctx: SqlContext): any {
        let left = this.nodes[0].compute(ctx);
        if (left instanceof SqlError) {
            return left;
        }
        let right = this.nodes[1].compute(ctx);
        if (right instanceof SqlError) {
            return right;
        }
        return [left, right];
    }
}