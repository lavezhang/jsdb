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
 * 标识符节点。
 */
var SqlIdentityNode = /** @class */ (function (_super) {
    __extends(SqlIdentityNode, _super);
    function SqlIdentityNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlIdentityNode.prototype.create = function () {
        return new SqlIdentityNode(null, null, null);
    };
    SqlIdentityNode.prototype.typeDeriva = function (ctx) {
        if (!ctx.dataTable) {
            return SqlColumnType.varchar;
        }
        var col = ctx.dataTable.getColumnByName(this.value);
        if (col && col.type == SqlColumnType.number) {
            return SqlColumnType.number;
        }
        return SqlColumnType.varchar;
    };
    SqlIdentityNode.prototype.compute = function (ctx) {
        if (!ctx.dataTable || ctx.rowIndex < 0 || ctx.rowIndex >= ctx.dataTable.rows.length) {
            return null;
        }
        var col = ctx.dataTable.getColumnByName(this.value);
        if (!col) {
            return new SqlError('不存在的列：' + this.value, this.line);
        }
        return ctx.dataTable.getValueByIndex(ctx.rowIndex, col.index);
    };
    return SqlIdentityNode;
}(SqlNode));
