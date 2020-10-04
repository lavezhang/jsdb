///<reference path="SqlNode.ts"/>
/**
 * 占位符节点。
 */
class SqlExpHoldNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlExpHoldNode(null, null, null);
    }

    public getDataType(ctx: SqlContext): SqlColumnType {
        return SqlColumnType.varchar;
    }

    public compute(ctx: SqlContext): any {
        if (!ctx.parameters || ctx.parameters.length <= 0) {
            return null;
        }
        if (ctx.holdIndex < 0) {
            ctx.holdIndex = 0;
        }
        if (ctx.holdIndex >= ctx.parameters.length) {
            return new SqlError('动态参数值的数量不足。', this.line);
        }
        return ctx.parameters[ctx.holdIndex++];
    }
}