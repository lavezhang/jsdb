/**
 * SQL分组值。
 */
var SqlGroupByValue = /** @class */ (function () {
    function SqlGroupByValue() {
        this.value = null;
        this.count = 0; //辅助列：分组项的行数
        this.sum = 0; //辅助列：分组项的合计
        this.distinctValues = []; //辅助列：分组项的去重值
    }
    return SqlGroupByValue;
}());
