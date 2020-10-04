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
 * delete节点。
 */
var SqlDeleteNode = /** @class */ (function (_super) {
    __extends(SqlDeleteNode, _super);
    function SqlDeleteNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlDeleteNode.prototype.create = function () {
        return new SqlDeleteNode(null, null, null);
    };
    SqlDeleteNode.prototype.toSql = function () {
        var buf = this.value + ' ' + this.nodes[0].toSql();
        if (this.nodes.length > 1) {
            buf += ' ' + this.nodes[1].toSql();
        }
        return buf;
    };
    SqlDeleteNode.prototype.typeDeriva = function (ctx) {
        return SqlColumnType.number;
    };
    SqlDeleteNode.prototype.compute = function (ctx) {
        var tableName = this.nodes[0].nodes[0].value;
        var table = ctx.database.tables[tableName];
        if (!table) {
            return new SqlError('不存在指定的表：' + tableName, this.line);
        }
        ctx.dataTable = table;
        var deletedCount = 0;
        if (this.nodes.length >= 2) {
            for (var i = table.rows.length - 1; i >= 0; i--) {
                ctx.rowIndex = i;
                ctx.holdIndex = -1;
                var v = this.nodes[1].compute(ctx);
                if (v instanceof SqlError) {
                    return v;
                }
                if (v) {
                    table.deleteRow(i);
                    deletedCount++;
                }
            }
        }
        else {
            deletedCount = table.rows.length;
            table.rows = [];
        }
        return deletedCount;
    };
    return SqlDeleteNode;
}(SqlNode));
