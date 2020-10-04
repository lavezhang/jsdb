/**
 * SQL数据行。
 */
var SqlDataRow = /** @class */ (function () {
    function SqlDataRow(rowValues, isGlobalUnique) {
        if (isGlobalUnique === void 0) { isGlobalUnique = true; }
        this.orderByValues = [];
        this.id = SqlDataRow.newRowId(rowValues, isGlobalUnique);
        this.values = rowValues;
    }
    /**
     * 深度克隆。
     */
    SqlDataRow.prototype.clone = function () {
        var rv = [];
        for (var i in this.values) {
            rv[i] = this.values[i];
        }
        var r = new SqlDataRow(rv, true);
        r.id = this.id;
        return r;
    };
    /**
     * 生成数据行的ID。
     * @param rowValues 数据行的值。
     * @param isGlobalUnique 是否全局唯一。
     */
    SqlDataRow.newRowId = function (rowValues, isGlobalUnique) {
        var buf = '';
        if (isGlobalUnique) {
            for (var i = 0; i < 8; i++) {
                buf += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                if (i < 7) {
                    buf += '-';
                }
            }
            buf = buf.substr(0, buf.length - 1);
        }
        else {
            for (var i = 0; i < rowValues.length; i++) {
                buf += '$';
                var v = rowValues[i];
                if (v == null) {
                    buf += 'null';
                }
                else if (typeof v == 'string') {
                    buf += "'" + v + "'";
                }
                else {
                    buf += v + '';
                }
            }
            if (buf.length == 0) {
                buf = '_';
            }
        }
        return buf;
    };
    return SqlDataRow;
}());
