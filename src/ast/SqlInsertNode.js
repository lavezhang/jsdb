var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
///<reference path="SqlNode.ts"/>
/**
 * insert节点。
 */
var SqlInsertNode = /** @class */ (function (_super) {
    __extends(SqlInsertNode, _super);
    function SqlInsertNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlInsertNode.prototype.create = function () {
        return new SqlInsertNode(null, null, null);
    };
    SqlInsertNode.prototype.toSql = function () {
        return this.value + ' ' + this.nodes[0].toSql() + this.nodes[1].toSql() + 'values' + this.nodes[2].toSql();
    };
    SqlInsertNode.prototype.compute = function (ctx) {
        var tableName = this.nodes[0].value;
        var table = ctx.database.tables[tableName];
        if (!table) {
            return new SqlError('不存在指定的表：' + tableName, this.line);
        }
        var fieldsNodes = this.nodes[1].nodes;
        var valuesNodes = this.nodes[2].nodes;
        var row = table.newRow();
        ctx.holdIndex = -1;
        for (var j = 0; j < fieldsNodes.length; j++) {
            var colName = fieldsNodes[j].value;
            var colIndex = table.getColumnByName(colName).index;
            var valueNode = valuesNodes[j];
            var v = valueNode.compute(ctx);
            if (v instanceof SqlError) {
                return v;
            }
            row.values[colIndex] = v;
        }
        table.addDataRow(row);
        return 1;
    };
    return SqlInsertNode;
}(SqlNode));
