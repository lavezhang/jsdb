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
 * having节点。
 */
var SqlHavingNode = /** @class */ (function (_super) {
    __extends(SqlHavingNode, _super);
    function SqlHavingNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlHavingNode.prototype.create = function () {
        return new SqlHavingNode(null, null, null);
    };
    SqlHavingNode.prototype.compute = function (ctx) {
        return this.nodes[0].compute(ctx);
    };
    return SqlHavingNode;
}(SqlNode));
