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
 * 占位符节点。
 */
var SqlExpHoldNode = /** @class */ (function (_super) {
    __extends(SqlExpHoldNode, _super);
    function SqlExpHoldNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlExpHoldNode.prototype.create = function () {
        return new SqlExpHoldNode(null, null, null);
    };
    SqlExpHoldNode.prototype.getDataType = function (ctx) {
        return SqlColumnType.varchar;
    };
    SqlExpHoldNode.prototype.compute = function (ctx) {
        if (!ctx.parameters || ctx.parameters.length <= 0) {
            return null;
        }
        if (ctx.holdIndex < 0) {
            ctx.holdIndex = 0;
        }
        if (ctx.holdIndex >= ctx.parameters.length) {
            return new SqlError('动态参数值的数量不足。', this.line);
        }
        return ctx.parameters[ctx.holdIndex++];
    };
    return SqlExpHoldNode;
}(SqlNode));
