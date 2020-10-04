///<reference path="SqlNode.ts"/>
/**
 * update节点。
 */
class SqlUpdateNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlUpdateNode(null, null, null);
    }

    public toSql(): string {
        let buf = this.value + ' ' + this.nodes[0].toSql() + ' set ';
        for (let i = 0; i < this.nodes[1].nodes.length; i++) {
            buf += this.nodes[1].nodes[i].toSql();
            if (i < this.nodes[1].nodes.length - 1) {
                buf += ', ';
            }
        }
        if (this.nodes.length > 2) {
            buf += ' ' + this.nodes[2].toSql();
        }
        return buf;
    }

    public compute(ctx: SqlContext): any {
        let tableName = this.nodes[0].nodes[0].value;
        let table: SqlDataTable = ctx.database.tables[tableName];
        if (!table) {
            return new SqlError('不存在指定的表：' + tableName, this.line);
        }

        ctx.dataTable = table;

        let updateCols = [];
        let updateValueNodes = [];
        for (let j in this.nodes[1].nodes) {
            let setNode = this.nodes[1].nodes[j];
            let colName = setNode.nodes[0].value;
            let col = table.getColumnByName(colName);
            if (!col) {
                return new SqlError('不存在指定的列：' + colName, setNode.nodes[0].line);
            }
            updateCols.push(col);
            updateValueNodes.push(setNode.nodes[1]);
        }

        let updateRowIndexList = [];
        if (this.nodes.length == 2) {
            for (let i = 0; i < table.rows.length; i++) {
                updateRowIndexList.push(i);
            }
        } else if (this.nodes.length == 3) {
            for (let i = 0; i < table.rows.length; i++) {
                ctx.rowIndex = i;
                ctx.holdIndex = -1;
                let whereValue = this.nodes[2].compute(ctx);
                if (whereValue instanceof SqlError) {
                    return whereValue;
                }
                if (whereValue) {
                    updateRowIndexList.push(i);
                }
            }
        }

        for (let i in updateRowIndexList) {
            ctx.rowIndex = updateRowIndexList[i];
            ctx.holdIndex = -1;
            for (let j in updateCols) {
                let col = updateCols[j];
                let v = updateValueNodes[j].compute(ctx);
                if (v instanceof SqlError) {
                    return v;
                }
                table.setValueByIndex(ctx.rowIndex, col.index, v);
            }
        }

        return updateRowIndexList.length;
    }
}