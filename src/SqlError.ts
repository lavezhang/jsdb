/**
 * SQL错误类。
 */
class SqlError {
    constructor(msg: string, line: number) {
        this.msg = msg;
        this.line = line;
    }

    public msg: string;
    public line: number;

    public print(): void {
        console.log('ERROR @ ' + this.line + ': ' + this.msg);
    }
}