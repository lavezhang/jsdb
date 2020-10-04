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
 * 条件或节点(or)。
 */
var SqlExpOrNode = /** @class */ (function (_super) {
    __extends(SqlExpOrNode, _super);
    function SqlExpOrNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlExpOrNode.prototype.create = function () {
        return new SqlExpOrNode(null, null, null);
    };
    SqlExpOrNode.prototype.toSql = function () {
        var buf = '';
        if (this.nodes[0] instanceof SqlExpAndNode || this.nodes[0] instanceof SqlExpOrNode || this.nodes[0] instanceof SqlExpUnaryNode) {
            buf += '(' + this.nodes[0].toSql() + ')';
        }
        else {
            buf += this.nodes[0].toSql();
        }
        buf += ' ' + this.value + ' ';
        if (this.nodes[1] instanceof SqlExpAndNode || this.nodes[1] instanceof SqlExpOrNode || this.nodes[1] instanceof SqlExpUnaryNode) {
            buf += '(' + this.nodes[1].toSql() + ')';
        }
        else {
            buf += this.nodes[1].toSql();
        }
        return buf;
    };
    SqlExpOrNode.prototype.typeDeriva = function (ctx) {
        return SqlColumnType.number;
    };
    SqlExpOrNode.prototype.compute = function (ctx) {
        var left = this.nodes[0].compute(ctx);
        if (left instanceof SqlError) {
            return left;
        }
        var right = this.nodes[1].compute(ctx);
        if (right instanceof SqlError) {
            return right;
        }
        if (typeof left == 'boolean' && typeof right == 'boolean') {
            return left || right;
        }
        return false;
    };
    return SqlExpOrNode;
}(SqlNode));
