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
 * 标识符引用节点。
 */
var SqlExpRefNode = /** @class */ (function (_super) {
    __extends(SqlExpRefNode, _super);
    function SqlExpRefNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlExpRefNode.prototype.create = function () {
        return new SqlExpRefNode(null, null, null);
    };
    SqlExpRefNode.prototype.typeDeriva = function (ctx) {
        if (!ctx.dataTable) {
            return SqlColumnType.varchar;
        }
        var col = ctx.dataTable.getColumnByName(this.value);
        if (!col) {
            var items = this.value.split('.');
            col = ctx.dataTable.getColumnByName(ctx.tableAliasMap[items[0]] + '.' + items[1]);
        }
        if (col && col.type == SqlColumnType.number) {
            return SqlColumnType.number;
        }
        return SqlColumnType.varchar;
    };
    SqlExpRefNode.prototype.compute = function (ctx) {
        if (!ctx.dataTable || ctx.rowIndex < 0 || ctx.rowIndex >= ctx.dataTable.rows.length) {
            return null;
        }
        var col = ctx.dataTable.getColumnByName(this.value);
        if (!col) {
            return new SqlError('不存在的列引用：' + this.value, this.line);
        }
        return ctx.dataTable.getValueByIndex(ctx.rowIndex, col.index);
    };
    return SqlExpRefNode;
}(SqlNode));
