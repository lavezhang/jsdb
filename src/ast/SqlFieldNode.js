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
 * field节点。
 */
var SqlFieldNode = /** @class */ (function (_super) {
    __extends(SqlFieldNode, _super);
    function SqlFieldNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlFieldNode.prototype.create = function () {
        return new SqlFieldNode(null, null, null);
    };
    SqlFieldNode.prototype.toSql = function () {
        var buf = this.nodes[0].toSql();
        if (this.value) {
            buf += ' as ' + this.value;
        }
        return buf;
    };
    SqlFieldNode.prototype.typeDeriva = function (ctx) {
        return this.nodes[0].typeDeriva(ctx);
    };
    SqlFieldNode.prototype.compute = function (ctx) {
        return this.nodes[0].compute(ctx);
    };
    return SqlFieldNode;
}(SqlNode));
