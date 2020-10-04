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
 * update节点。
 */
var SqlUpdateNode = /** @class */ (function (_super) {
    __extends(SqlUpdateNode, _super);
    function SqlUpdateNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlUpdateNode.prototype.create = function () {
        return new SqlUpdateNode(null, null, null);
    };
    SqlUpdateNode.prototype.toSql = function () {
        var buf = this.value + ' ' + this.nodes[0].toSql() + ' set ';
        for (var i = 0; i < this.nodes[1].nodes.length; i++) {
            buf += this.nodes[1].nodes[i].toSql();
            if (i < this.nodes[1].nodes.length - 1) {
                buf += ', ';
            }
        }
        if (this.nodes.length > 2) {
            buf += ' ' + this.nodes[2].toSql();
        }
        return buf;
    };
    SqlUpdateNode.prototype.compute = function (ctx) {
        var tableName = this.nodes[0].nodes[0].value;
        var table = ctx.database.tables[tableName];
        if (!table) {
            return new SqlError('不存在指定的表：' + tableName, this.line);
        }
        ctx.dataTable = table;
        var updateCols = [];
        var updateValueNodes = [];
        for (var j in this.nodes[1].nodes) {
            var setNode = this.nodes[1].nodes[j];
            var colName = setNode.nodes[0].value;
            var col = table.getColumnByName(colName);
            if (!col) {
                return new SqlError('不存在指定的列：' + colName, setNode.nodes[0].line);
            }
            updateCols.push(col);
            updateValueNodes.push(setNode.nodes[1]);
        }
        var updateRowIndexList = [];
        if (this.nodes.length == 2) {
            for (var i = 0; i < table.rows.length; i++) {
                updateRowIndexList.push(i);
            }
        }
        else if (this.nodes.length == 3) {
            for (var i = 0; i < table.rows.length; i++) {
                ctx.rowIndex = i;
                ctx.holdIndex = -1;
                var whereValue = this.nodes[2].compute(ctx);
                if (whereValue instanceof SqlError) {
                    return whereValue;
                }
                if (whereValue) {
                    updateRowIndexList.push(i);
                }
            }
        }
        for (var i in updateRowIndexList) {
            ctx.rowIndex = updateRowIndexList[i];
            ctx.holdIndex = -1;
            for (var j in updateCols) {
                var col = updateCols[j];
                var v = updateValueNodes[j].compute(ctx);
                if (v instanceof SqlError) {
                    return v;
                }
                table.setValueByIndex(ctx.rowIndex, col.index, v);
            }
        }
        return updateRowIndexList.length;
    };
    return SqlUpdateNode;
}(SqlNode));
