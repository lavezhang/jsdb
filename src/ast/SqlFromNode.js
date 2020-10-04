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
 * from节点。
 */
var SqlFromNode = /** @class */ (function (_super) {
    __extends(SqlFromNode, _super);
    function SqlFromNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlFromNode.prototype.create = function () {
        return new SqlFromNode(null, null, null);
    };
    return SqlFromNode;
}(SqlNode));
