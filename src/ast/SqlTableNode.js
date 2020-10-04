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
 * table节点。
 */
var SqlTableNode = /** @class */ (function (_super) {
    __extends(SqlTableNode, _super);
    function SqlTableNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlTableNode.prototype.create = function () {
        return new SqlTableNode(null, null, null);
    };
    SqlTableNode.prototype.toSql = function () {
        var buf = this.nodes[0].toSql();
        if (this.value) {
            buf += ' ' + this.value;
        }
        return buf;
    };
    return SqlTableNode;
}(SqlNode));
