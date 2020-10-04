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
 * 参数列表节点。
 */
var SqlParamsNode = /** @class */ (function (_super) {
    __extends(SqlParamsNode, _super);
    function SqlParamsNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlParamsNode.prototype.create = function () {
        return new SqlParamsNode(null, null, null);
    };
    SqlParamsNode.prototype.toSql = function () {
        var buf = '(';
        for (var i = 0; i < this.nodes.length; i++) {
            buf += this.nodes[i].toSql();
            if (i < this.nodes.length - 1) {
                buf += ', ';
            }
        }
        buf += ')';
        return buf;
    };
    SqlParamsNode.prototype.compute = function (ctx) {
        if (this.value == ',') {
            var list = [];
            for (var i = 0; i < this.nodes.length; i++) {
                var v = this.nodes[i].compute(ctx);
                if (v instanceof SqlError) {
                    return v;
                }
                list.push(v);
            }
            return list;
        }
        return null;
    };
    return SqlParamsNode;
}(SqlNode));
