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
 * order by节点。
 */
var SqlOrderByNode = /** @class */ (function (_super) {
    __extends(SqlOrderByNode, _super);
    function SqlOrderByNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlOrderByNode.prototype.create = function () {
        return new SqlOrderByNode(null, null, null);
    };
    SqlOrderByNode.prototype.toSql = function () {
        var buf = this.value + ' ';
        for (var i = 0; i < this.nodes.length; i++) {
            buf += this.nodes[i].toSql();
            if (i < this.nodes.length - 1) {
                buf += ', ';
            }
        }
        return buf;
    };
    return SqlOrderByNode;
}(SqlNode));
