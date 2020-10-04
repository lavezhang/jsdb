/**
 * SQL错误类。
 */
var SqlError = /** @class */ (function () {
    function SqlError(msg, line) {
        this.msg = msg;
        this.line = line;
    }
    SqlError.prototype.print = function () {
        console.log('ERROR @ ' + this.line + ': ' + this.msg);
    };
    return SqlError;
}());
