///<reference path="SqlColumnType.ts"/>
/**
 * SQL数据列。
 */
var SqlDataColumn = /** @class */ (function () {
    function SqlDataColumn(index, name, type) {
        this.index = index;
        this.name = name;
        this.type = type;
        this.node = null;
    }
    return SqlDataColumn;
}());
