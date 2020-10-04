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
 * between and节点。
 */
var SqlBetweenAndNode = /** @class */ (function (_super) {
    __extends(SqlBetweenAndNode, _super);
    function SqlBetweenAndNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlBetweenAndNode.prototype.create = function () {
        return new SqlBetweenAndNode(null, null, null);
    };
    SqlBetweenAndNode.prototype.toSql = function () {
        return this.nodes[0].toSql() + ' and ' + this.nodes[1].toSql();
    };
    SqlBetweenAndNode.prototype.compute = function (ctx) {
        var left = this.nodes[0].compute(ctx);
        if (left instanceof SqlError) {
            return left;
        }
        var right = this.nodes[1].compute(ctx);
        if (right instanceof SqlError) {
            return right;
        }
        return [left, right];
    };
    return SqlBetweenAndNode;
}(SqlNode));
