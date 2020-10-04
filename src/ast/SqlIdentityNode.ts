///<reference path="SqlNode.ts"/>
/**
 * 标识符节点。
 */
class SqlIdentityNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlIdentityNode(null, null, null);
    }

    public typeDeriva(ctx: SqlContext): SqlColumnType {
        if (!ctx.dataTable) {
            return SqlColumnType.varchar;
        }
        let col = ctx.dataTable.getColumnByName(this.value);
        if (col && col.type == SqlColumnType.number) {
            return SqlColumnType.number;
        }
        return SqlColumnType.varchar;
    }

    public compute(ctx: SqlContext): any {
        if (!ctx.dataTable || ctx.rowIndex < 0 || ctx.rowIndex >= ctx.dataTable.rows.length) {
            return null;
        }
        let col = ctx.dataTable.getColumnByName(this.value);
        if (!col) {
            return new SqlError('不存在的列：' + this.value, this.line);
        }
        return ctx.dataTable.getValueByIndex(ctx.rowIndex, col.index);
    }
}