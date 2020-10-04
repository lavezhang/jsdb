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
 * joins节点。
 */
var SqlJoinsNode = /** @class */ (function (_super) {
    __extends(SqlJoinsNode, _super);
    function SqlJoinsNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlJoinsNode.prototype.create = function () {
        return new SqlJoinsNode(null, null, null);
    };
    return SqlJoinsNode;
}(SqlNode));
