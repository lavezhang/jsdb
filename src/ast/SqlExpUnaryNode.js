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
 * 一元操作符节点（正好、负号、not）。
 */
var SqlExpUnaryNode = /** @class */ (function (_super) {
    __extends(SqlExpUnaryNode, _super);
    function SqlExpUnaryNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlExpUnaryNode.prototype.create = function () {
        return new SqlExpUnaryNode(null, null, null);
    };
    SqlExpUnaryNode.prototype.typeDeriva = function (ctx) {
        return SqlColumnType.number;
    };
    SqlExpUnaryNode.prototype.compute = function (ctx) {
        var v = this.nodes[0].compute(ctx);
        if (typeof v == 'number') {
            if (this.value == '+') {
                return v;
            }
            else if (this.value == '-') {
                return -v;
            }
        }
        else if (typeof v == 'boolean') {
            return !v;
        }
        return null;
    };
    return SqlExpUnaryNode;
}(SqlNode));
