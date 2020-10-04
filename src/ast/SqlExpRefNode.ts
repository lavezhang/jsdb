///<reference path="SqlNode.ts"/>
/**
 * 标识符引用节点。
 */
class SqlExpRefNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlExpRefNode(null, null, null);
    }

    public typeDeriva(ctx: SqlContext): SqlColumnType {
        if (!ctx.dataTable) {
            return SqlColumnType.varchar;
        }
        let col = ctx.dataTable.getColumnByName(this.value);
        if (!col) {
            let items = this.value.split('.');
            col = ctx.dataTable.getColumnByName(ctx.tableAliasMap[items[0]] + '.' + items[1]);
        }
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
            return new SqlError('不存在的列引用：' + this.value, this.line);
        }
        return ctx.dataTable.getValueByIndex(ctx.rowIndex, col.index);
    }
}