///<reference path="SqlDataColumn.ts"/>
///<reference path="SqlDataRow.ts"/>
/**
 * SQL数据表。
 * 该类用于存储一张二维表，或者查询结果。
 */
class SqlDataTable {
    constructor(name: string) {
        this.name = name;
        this.rows = [];
        this.rowMap = [];
        this.columnNames = [];
        this.columns = [];
    }

    public name: string;
    public rows: SqlDataRow[];
    public rowMap: SqlDataRow[];
    public columnNames: string[];
    private columns: SqlDataColumn[];

    /**
     * 添加数据列。
     * @param name
     * @param type
     */
    public addColumn(name: string, type: string | SqlColumnType): SqlDataColumn {
        if (!name) {
            return null;
        }
        name = name.toLowerCase();
        if (this.columns[name]) {
            return null;
        }

        var colType = SqlColumnType.varchar;
        if (type == 'number' || type == SqlColumnType.number) {
            colType = SqlColumnType.number;
        }

        let col = new SqlDataColumn(this.columnNames.length, name, colType);
        this.columnNames.push(name);
        this.columns[name] = col;
        if (name.indexOf('.') > 0) {
            this.columns[name.split('.')[1]] = col;
        }
        return col;
    }

    /**
     * 添加数行。
     * @param rowValues
     */
    public addRow(rowValues: any[]): SqlDataRow {
        if (!rowValues || rowValues.length != this.columnNames.length) {
            return null;
        }
        for (let j = 0; j < this.columnNames.length; j++) {
            var col = this.columns[this.columnNames[j]];
            if (col.type == SqlColumnType.varchar && typeof rowValues[j] == 'number') {
                rowValues[j] = rowValues[j] + '';
            } else if (col.type == SqlColumnType.number && typeof rowValues[j] == 'string') {
                rowValues[j] = rowValues[j].indexOf('.') >= 0 ? parseFloat(rowValues[j]) : parseInt(rowValues[j]);
            }
        }
        return this.addDataRow(new SqlDataRow(rowValues));
    }

    /**
     * 添加数据行。
     * @param row
     */
    public addDataRow(row: SqlDataRow): SqlDataRow {
        if (!row || !row.id) {
            return null;
        }
        let r = this.rowMap[row.id];
        if (r) {
            return r;
        }
        this.rows.push(row);
        this.rowMap[row.id] = row;
        return row;
    }

    /**
     * 新建一行。
     */
    public newRow(): SqlDataRow {
        let row = [];
        for (let j = 0; j < this.columnNames.length; j++) {
            row.push(null);
        }
        return new SqlDataRow(row);
    }

    /**
     * 获取指定的数据行。
     * @param rowIndex 数据行号（从0开始）。
     */
    public getRow(rowIndex: number): SqlDataRow {
        return rowIndex >= 0 && rowIndex < this.rows.length ? this.rows[rowIndex] : null;
    }

    /**
     * 获取指定的数据行。
     * @param rowId 数据行ID。
     */
    public getRowById(rowId: string): SqlDataRow {
        return rowId ? (this.rowMap[rowId] || null) : null;
    }

    /**
     * 获取指定的列。
     * @param index
     */
    public getColumnByIndex(index: number): SqlDataColumn {
        if (index < 0 || index >= this.columnNames.length) {
            return null;
        }
        let colName = this.columnNames[index];
        return this.columns[colName];
    }

    /**
     * 获取指定的列。
     * @param index
     */
    public getColumnByName(name: string): SqlDataColumn {
        if (!name) {
            return null;
        }
        let col = this.columns[name];
        if (col) {
            return col;
        }
        name = name.toLowerCase();
        col = this.columns[name];
        if (col) {
            return col;
        }
        let items = name.split('.');
        if (items.length == 2) {
            return this.columns[items[1]];
        }
        return null;
    }

    /**
     * 获取指定行指定列的值。
     * @param rowIndex 数据行号（从0开始）。
     * @param colIndex 数据列号（从0开始）。
     */
    public getValueByIndex(rowIndex: number, colIndex: number): any {
        let row = this.getRow(rowIndex).values;
        if (!row) {
            return null;
        }
        return colIndex >= 0 && colIndex < row.length ? row[colIndex] : null;
    }

    /**
     * 获取指定行指定列的值。
     * @param rowIndex 数据行号（从0开始）。
     * @param colName 数据列名。
     */
    public getValueByName(rowIndex: number, colName: string): any {
        if (!colName) {
            return null;
        }
        let col = this.getColumnByName(colName);
        if (!col) {
            return null;
        }
        return this.getValueByIndex(rowIndex, col.index);
    }

    /**
     * 设置指定行指定列的值。
     * @param rowIndex 数据行号（从0开始）。
     * @param colIndex 数据列号（从0开始）。
     * @param value 值。
     */
    public setValueByIndex(rowIndex: number, colIndex: number, value: any): boolean {
        let row = this.getRow(rowIndex).values;
        if (!row) {
            return false;
        }
        if (colIndex >= 0 && colIndex < row.length) {
            row[colIndex] = value;
            return true;
        }
        return false;
    }

    /**
     * 设置指定行指定列的值。
     * @param rowIndex 数据行号（从0开始）。
     * @param colName 数据列名。
     * @param value 值。
     */
    public setValueByName(rowIndex: number, colName: string, value: any): boolean {
        if (!colName) {
            return false;
        }
        let col = this.getColumnByName(colName);
        if (!col) {
            return false;
        }
        return this.setValueByIndex(rowIndex, col.index, value);
    }

    /**
     * 删除指定的数据行。
     * @param rowIndex 数据行号（从0开始）。
     */
    public deleteRow(rowIndex: number): SqlDataRow {
        if (rowIndex < 0 || rowIndex >= this.rows.length) {
            return null;
        }
        let row = this.rows[rowIndex];
        if (!row) {
            return null;
        }
        this.rows.splice(rowIndex, 1);
        delete this.rowMap[row.id];
        return row;
    }

    /**
     * 删除指定的数据行。
     * @param rowId 数据行ID。
     */
    public deleteRowById(rowId: string): SqlDataRow {
        if (!rowId) {
            return null;
        }
        let row = this.rowMap[rowId];
        if (!row) {
            return null;
        }
        for (let i = 0; i < this.rows.length; i++) {
            if (this.rows[i].id == rowId) {
                this.rows.splice(i, 1);
                break;
            }
        }
        delete this.rowMap[row.id];
        return row;
    }

    /**
     * 转换为表格html。
     */
    public toHtml(): string {
        let html = "<table><tr>";
        for(let j = 0; j < this.columnNames.length; j++) {
            html += "<th>" + this.columnNames[j] + "</th>";
        }
        html += '</tr>';
        for(let i = 0; i < this.rows.length; i++) {
            html += "<tr>";
            for (let j in this.rows[i].values){
                var v = (this.rows[i].values[j] + '').replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/ /g, "&nbsp;")
                    .replace(/\'/g, "&#39;")
                    .replace(/\"/g, "&quot;");
                html += "<td id='" + this.rows[i].id + "'>" + v + "</td>";
            }
            html += "</tr>";
        }
        html += "</table>";
        return html;
    }

    /**
     * 打印数据表
     */
    public print(): void {
        //计算每一列的最大宽度
        let colWidths = [];
        for (let j = 0; j < this.columnNames.length; j++) {
            colWidths.push(this.columnNames[j].length + 1);
            for (let i = 0; i < this.rows.length; i++) {
                let v = this.rows[i].values[j] + '';
                let len = (v + '').length + 1;
                if (len > colWidths[j]) {
                    colWidths[j] = len;
                }
            }
        }

        let buf = '--------------------------------\n';
        for (let j = 0; j < this.columnNames.length; j++) {
            let v = this.columnNames[j];
            if (v.length < colWidths[j]) {
                for (let k = v.length; k < colWidths[j]; k++) {
                    v = v + ' ';
                }
            }
            buf += v + ' ';
        }
        buf += "\n--------------------------------\n";

        for (let i = 0; i < this.rows.length; i++) {
            let row = this.rows[i].values;
            for (let j = 0; j < this.columnNames.length; j++) {
                //按照所在列的宽度输出内容
                let v = row[j] + '';
                if (v.length < colWidths[j]) {
                    for (let k = v.length; k < colWidths[j]; k++) {
                        v = v + ' ';
                    }
                }
                buf += v + ' ';
            }
            buf += '\n';
        }
        buf += "-----------total: " + this.rows.length + "------------\n";

        console.log(buf);
    }

}