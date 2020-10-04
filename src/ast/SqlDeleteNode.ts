///<reference path="SqlNode.ts"/>
/**
 * delete节点。
 */
class SqlDeleteNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlDeleteNode(null, null, null);
    }

    public toSql(): string {
        let buf = this.value + ' ' + this.nodes[0].toSql();
        if (this.nodes.length > 1) {
            buf += ' ' + this.nodes[1].toSql();
        }
        return buf;
    }

    public typeDeriva(ctx: SqlContext): SqlColumnType {
        return SqlColumnType.number;
    }

    public compute(ctx: SqlContext): any {
        let tableName = this.nodes[0].nodes[0].value;
        let table: SqlDataTable = ctx.database.tables[tableName];
        if (!table) {
            return new SqlError('不存在指定的表：' + tableName, this.line);
        }

        ctx.dataTable = table;

        let deletedCount = 0;
        if (this.nodes.length >= 2) {
            for (let i = table.rows.length - 1; i >= 0; i--) {
                ctx.rowIndex = i;
                ctx.holdIndex = -1;
                let v = this.nodes[1].compute(ctx);
                if (v instanceof SqlError) {
                    return v;
                }
                if (v) {
                    table.deleteRow(i);
                    deletedCount++;
                }
            }
        } else {
            deletedCount = table.rows.length;
            table.rows = [];
        }

        return deletedCount;
    }
}