///<reference path="SqlNode.ts"/>
/**
 * insert节点。
 */
class SqlInsertNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlInsertNode(null, null, null);
    }

    public toSql(): string {
        return this.value + ' ' + this.nodes[0].toSql() + this.nodes[1].toSql() + 'values' + this.nodes[2].toSql();
    }

    public compute(ctx: SqlContext): any {
        let tableName = this.nodes[0].value;
        let table = ctx.database.tables[tableName];
        if (!table) {
            return new SqlError('不存在指定的表：' + tableName, this.line);
        }

        let fieldsNodes = this.nodes[1].nodes;
        let valuesNodes = this.nodes[2].nodes;

        let row = table.newRow();
        ctx.holdIndex = -1;
        for (let j = 0; j < fieldsNodes.length; j++) {
            let colName = fieldsNodes[j].value;
            let colIndex = table.getColumnByName(colName).index;
            let valueNode = valuesNodes[j];
            let v = valueNode.compute(ctx);
            if (v instanceof SqlError) {
                return v;
            }
            row.values[colIndex] = v;
        }
        table.addDataRow(row);

        return 1;
    }
}