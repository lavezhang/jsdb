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
 * 等于节点。
 */
var SqlExpEqNode = /** @class */ (function (_super) {
    __extends(SqlExpEqNode, _super);
    function SqlExpEqNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlExpEqNode.prototype.create = function () {
        return new SqlExpEqNode(null, null, null);
    };
    SqlExpEqNode.prototype.typeDeriva = function (ctx) {
        return SqlColumnType.number;
    };
    SqlExpEqNode.prototype.compute = function (ctx) {
        var left = this.nodes[0].compute(ctx);
        if (left instanceof SqlError) {
            return left;
        }
        var right = this.nodes[1].compute(ctx);
        if (right instanceof SqlError) {
            return right;
        }
        if (this.value == '=') {
            return this.isEqual(ctx, left, right);
        }
        else if (this.value == '<>') {
            var v = this.isEqual(ctx, left, right);
            return !v;
        }
        else if (this.value == 'in') {
            return this.isIn(left, right);
        }
        else if (this.value == 'not in') {
            var v = this.isIn(left, right);
            return !v;
        }
        else if (this.value == 'is' && right == null) {
            return left == null;
        }
        else if (this.value == 'is not' && right == null) {
            return left != null;
        }
        else if (this.value == 'like') {
            return this.isLike(left, right);
        }
        else if (this.value == 'not like') {
            var v = this.isLike(left, right);
            if (v instanceof SqlError) {
                return v;
            }
            return !v;
        }
        return false;
    };
    SqlExpEqNode.prototype.isEqual = function (ctx, left, right) {
        if (left == null || right == null) {
            return false;
        }
        if (left == right) {
            return true;
        }
        return (left + '') == (right + '');
    };
    SqlExpEqNode.prototype.isIn = function (left, right) {
        if (left == null || right == null) {
            return false;
        }
        if (right instanceof Array) {
            for (var i = 0; i < right.length; i++) {
                if ((right[i] + '') == (left + '')) {
                    return true;
                }
            }
        }
        return false;
    };
    SqlExpEqNode.prototype.isLike = function (left, right) {
        if (left == null || right == null) {
            return false;
        }
        var leftStr = left + '';
        var rightStr = right + '';
        var i = rightStr.indexOf('%');
        var j = rightStr.lastIndexOf('%');
        if (i == 0 && j == rightStr.length - 1) {
            return leftStr.indexOf(rightStr.substr(1, rightStr.length - 2)) >= 0;
        }
        else if (j == 0) {
            return leftStr.indexOf(rightStr.substr(0, rightStr.length - 1)) == 0;
        }
        else if (j == rightStr.length - 1) {
            return leftStr.indexOf(rightStr.substr(0, rightStr.length - 1)) == leftStr.length - rightStr.length - 1;
        }
        else {
            return new SqlError('暂不支持该匹配规则', this.line);
        }
    };
    return SqlExpEqNode;
}(SqlNode));
