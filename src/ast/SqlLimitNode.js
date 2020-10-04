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
 * limit节点。
 */
var SqlLimitNode = /** @class */ (function (_super) {
    __extends(SqlLimitNode, _super);
    function SqlLimitNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlLimitNode.prototype.create = function () {
        return new SqlLimitNode(null, null, null);
    };
    SqlLimitNode.prototype.toSql = function () {
        if (this.nodes.length == 2) {
            return this.value + ' ' + this.nodes[0].toSql() + ', ' + this.nodes[1].toSql();
        }
        return _super.prototype.toSql.call(this);
    };
    return SqlLimitNode;
}(SqlNode));
