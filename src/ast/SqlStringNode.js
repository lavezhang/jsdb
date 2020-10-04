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
 * 字符串节点。
 */
var SqlStringNode = /** @class */ (function (_super) {
    __extends(SqlStringNode, _super);
    function SqlStringNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlStringNode.prototype.create = function () {
        return new SqlStringNode(null, null, null);
    };
    SqlStringNode.prototype.typeDeriva = function (ctx) {
        return SqlColumnType.varchar;
    };
    SqlStringNode.prototype.compute = function (ctx) {
        if (!this.value) {
            return '';
        }
        //处理字符串转义
        var s = '';
        for (var i = 1; i < this.value.length - 1; i++) {
            var c = this.value[i];
            if (c == '\\') { //escape
                c = this.value[++i];
                if (c == 'r') {
                    c = '\r';
                }
                else if (c == 'n') {
                    c = '\n';
                }
                else if (c == 't') {
                    c = '\t';
                }
                s += c;
            }
            else {
                s += c;
            }
        }
        return s;
    };
    return SqlStringNode;
}(SqlNode));
