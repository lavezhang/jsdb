///<reference path="SqlColumnType.ts"/>
/**
 * SQL数据列。
 */
class SqlDataColumn {
    constructor(index: number, name: string, type: SqlColumnType) {
        this.index = index;
        this.name = name;
        this.type = type;
        this.node = null;
    }

    public index: number;
    public name: string;
    public type: SqlColumnType;
    public node: SqlNode;
}