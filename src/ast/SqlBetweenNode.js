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
 * between节点。
 */
var SqlBetweenNode = /** @class */ (function (_super) {
    __extends(SqlBetweenNode, _super);
    function SqlBetweenNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlBetweenNode.prototype.create = function () {
        return new SqlBetweenNode(null, null, null);
    };
    SqlBetweenNode.prototype.typeDeriva = function (ctx) {
        return SqlColumnType.number;
    };
    SqlBetweenNode.prototype.compute = function (ctx) {
        var value = this.nodes[0].compute(ctx);
        if (value instanceof SqlError) {
            return value;
        }
        var range = this.nodes[1].compute(ctx);
        if (range instanceof SqlError || !range) {
            return range;
        }
        var left = range[0];
        var right = range[1];
        if (value == null || left == null || right == null) {
            return false;
        }
        if (typeof value == 'number') {
            if (typeof left == 'string') {
                left = parseFloat(left);
            }
            if (typeof right == 'string') {
                right = parseFloat(right);
            }
            return value >= left && value <= right;
        }
        else {
            value = value + '';
            left = left + '';
            right = right + '';
            return value >= left && value <= right;
        }
    };
    return SqlBetweenNode;
}(SqlNode));
