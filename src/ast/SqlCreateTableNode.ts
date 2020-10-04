///<reference path="SqlNode.ts"/>
/**
 * create table 节点。
 */
class SqlCreateTableNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlCreateTableNode(null, null, null);
    }

    public toSql(): string {
        return this.value + ' ' + this.nodes[0].toSql() + this.nodes[1].toSql();
    }

    public compute(ctx: SqlContext): any {
        let table = new SqlDataTable(this.nodes[0].value);
        let paramsNode = this.nodes[1];
        let columnNames = [];
        for (let i = 0; i < paramsNode.nodes.length; i++) {
            let fieldDeclareNode = paramsNode.nodes[i];
            let colName = fieldDeclareNode.value;
            let colType = fieldDeclareNode.nodes[0].value;
            if (columnNames.indexOf(colName) >= 0) {
                return new SqlError('列名重复：' + colName, fieldDeclareNode.line);
            }
            table.addColumn(colName, colType);
            columnNames.push(fieldDeclareNode);
        }
        return ctx.database.addTable(table);
    }
}