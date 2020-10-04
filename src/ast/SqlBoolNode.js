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
 * 布尔值节点。
 */
var SqlBoolNode = /** @class */ (function (_super) {
    __extends(SqlBoolNode, _super);
    function SqlBoolNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlBoolNode.prototype.create = function () {
        return new SqlBoolNode(null, null, null);
    };
    SqlBoolNode.prototype.typeDeriva = function (ctx) {
        return SqlColumnType.number;
    };
    SqlBoolNode.prototype.compute = function (ctx) {
        return this.value == 'true';
    };
    return SqlBoolNode;
}(SqlNode));
