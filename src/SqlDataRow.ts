/**
 * SQL数据行。
 */
class SqlDataRow {
    constructor(rowValues: any[], isGlobalUnique: boolean = true) {
        this.id = SqlDataRow.newRowId(rowValues, isGlobalUnique);
        this.values = rowValues;
    }

    public id: string;
    public values: any[];
    public orderByValues = [];

    /**
     * 深度克隆。
     */
    public clone(): SqlDataRow {
        let rv = [];
        for (let i in this.values) {
            rv[i] = this.values[i];
        }
        let r = new SqlDataRow(rv, true);
        r.id = this.id;
        return r;
    }

    /**
     * 生成数据行的ID。
     * @param rowValues 数据行的值。
     * @param isGlobalUnique 是否全局唯一。
     */
    public static newRowId(rowValues: any[], isGlobalUnique: boolean): string {
        let buf = '';
        if (isGlobalUnique) {
            for (let i = 0; i < 8; i++) {
                buf += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                if (i < 7) {
                    buf += '-';
                }
            }
            buf = buf.substr(0, buf.length - 1);
        } else {
            for (let i = 0; i < rowValues.length; i++) {
                buf += '$';
                let v = rowValues[i];
                if (v == null) {
                    buf += 'null';
                } else if (typeof v == 'string') {
                    buf += "'" + v + "'";
                } else {
                    buf += v + '';
                }
            }
            if (buf.length == 0) {
                buf = '_';
            }
        }
        return buf;
    }
}