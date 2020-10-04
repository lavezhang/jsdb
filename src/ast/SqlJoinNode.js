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
 * join节点。
 */
var SqlJoinNode = /** @class */ (function (_super) {
    __extends(SqlJoinNode, _super);
    function SqlJoinNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlJoinNode.prototype.create = function () {
        return new SqlJoinNode(null, null, null);
    };
    SqlJoinNode.prototype.toSql = function () {
        return this.value + ' ' + this.nodes[0].toSql() + ' on ' + this.nodes[1].toSql();
    };
    return SqlJoinNode;
}(SqlNode));
