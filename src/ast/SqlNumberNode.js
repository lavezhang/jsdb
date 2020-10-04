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
 * number节点。
 */
var SqlNumberNode = /** @class */ (function (_super) {
    __extends(SqlNumberNode, _super);
    function SqlNumberNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlNumberNode.prototype.create = function () {
        return new SqlNumberNode(null, null, null);
    };
    SqlNumberNode.prototype.typeDeriva = function (ctx) {
        return SqlColumnType.number;
    };
    SqlNumberNode.prototype.compute = function (ctx) {
        return this.value.indexOf('.') >= 0 ? parseFloat(this.value) : parseInt(this.value);
    };
    return SqlNumberNode;
}(SqlNode));
