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
 * 修饰符节点（distinct）。
 */
var SqlModifiersNode = /** @class */ (function (_super) {
    __extends(SqlModifiersNode, _super);
    function SqlModifiersNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlModifiersNode.prototype.create = function () {
        return new SqlModifiersNode(null, null, null);
    };
    SqlModifiersNode.prototype.toSql = function () {
        if (this.nodes.length == 0) {
            return '';
        }
        var buf = '';
        for (var i = 0; i < this.nodes.length; i++) {
            buf += this.nodes[i].toSql();
            if (i < this.nodes.length - 1) {
                buf += this.value;
            }
        }
        return buf;
    };
    return SqlModifiersNode;
}(SqlNode));
