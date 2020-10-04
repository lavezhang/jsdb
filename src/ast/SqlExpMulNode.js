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
 * 乘除节点。
 */
var SqlExpMulNode = /** @class */ (function (_super) {
    __extends(SqlExpMulNode, _super);
    function SqlExpMulNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlExpMulNode.prototype.create = function () {
        return new SqlExpMulNode(null, null, null);
    };
    SqlExpMulNode.prototype.typeDeriva = function (ctx) {
        return SqlColumnType.number;
    };
    SqlExpMulNode.prototype.compute = function (ctx) {
        var left = this.nodes[0].compute(ctx);
        if (left instanceof SqlError) {
            return left;
        }
        var right = this.nodes[1].compute(ctx);
        if (right instanceof SqlError) {
            return right;
        }
        if (typeof left == 'number' && typeof right == 'number') {
            if (this.value == '*') {
                return left * right;
            }
            else if (this.value == '/') {
                return right != 0 ? (left / right) : null;
            }
            else if (this.value == '%') {
                return right != 0 ? (left % right) : null;
            }
        }
        return null;
    };
    return SqlExpMulNode;
}(SqlNode));
