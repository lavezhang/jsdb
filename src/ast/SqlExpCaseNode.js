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
 * case节点。
 */
var SqlExpCaseNode = /** @class */ (function (_super) {
    __extends(SqlExpCaseNode, _super);
    function SqlExpCaseNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlExpCaseNode.prototype.create = function () {
        return new SqlExpCaseNode(null, null, null);
    };
    SqlExpCaseNode.prototype.toSql = function () {
        var buf = this.value;
        for (var i = 0; i < this.nodes.length - 1; i += 2) {
            buf += ' when ' + this.nodes[i].toSql();
            buf += ' then ' + this.nodes[i + 1].toSql();
        }
        if (this.nodes.length % 2 == 1) {
            buf += ' else ' + this.nodes[this.nodes.length - 1].toSql();
        }
        buf += ' end';
        return buf;
    };
    SqlExpCaseNode.prototype.typeDeriva = function (ctx) {
        return this.nodes[1].typeDeriva(ctx);
    };
    SqlExpCaseNode.prototype.compute = function (ctx) {
        for (var i = 0; i < this.nodes.length - 1; i += 2) {
            var whenValue = this.nodes[i].compute(ctx);
            if (whenValue instanceof SqlError) {
                return whenValue;
            }
            var thenValue = this.nodes[i + 1].compute(ctx);
            if (thenValue instanceof SqlError) {
                return thenValue;
            }
            if (whenValue) {
                return thenValue;
            }
        }
        if (this.nodes.length % 2 == 1) {
            return this.nodes[this.nodes.length - 1].compute(ctx);
        }
        return null;
    };
    return SqlExpCaseNode;
}(SqlNode));
