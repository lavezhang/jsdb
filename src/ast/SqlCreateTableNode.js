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
 * create table 节点。
 */
var SqlCreateTableNode = /** @class */ (function (_super) {
    __extends(SqlCreateTableNode, _super);
    function SqlCreateTableNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlCreateTableNode.prototype.create = function () {
        return new SqlCreateTableNode(null, null, null);
    };
    SqlCreateTableNode.prototype.toSql = function () {
        return this.value + ' ' + this.nodes[0].toSql() + this.nodes[1].toSql();
    };
    SqlCreateTableNode.prototype.compute = function (ctx) {
        var table = new SqlDataTable(this.nodes[0].value);
        var paramsNode = this.nodes[1];
        var columnNames = [];
        for (var i = 0; i < paramsNode.nodes.length; i++) {
            var fieldDeclareNode = paramsNode.nodes[i];
            var colName = fieldDeclareNode.value;
            var colType = fieldDeclareNode.nodes[0].value;
            if (columnNames.indexOf(colName) >= 0) {
                return new SqlError('列名重复：' + colName, fieldDeclareNode.line);
            }
            table.addColumn(colName, colType);
            columnNames.push(fieldDeclareNode);
        }
        return ctx.database.addTable(table);
    };
    return SqlCreateTableNode;
}(SqlNode));
