///<reference path="SqlNode.ts"/>
/**
 * 字符串节点。
 */
class SqlStringNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlStringNode(null, null, null);
    }

    public typeDeriva(ctx: SqlContext): SqlColumnType {
        return SqlColumnType.varchar;
    }

    public compute(ctx: SqlContext): any {
        if (!this.value) {
            return '';
        }
        //处理字符串转义
        let s = '';
        for (let i = 1; i < this.value.length - 1; i++) {
            let c = this.value[i];
            if (c == '\\') {//escape
                c = this.value[++i];
                if (c == 'r') {
                    c = '\r';
                } else if (c == 'n') {
                    c = '\n';
                } else if (c == 't') {
                    c = '\t';
                }
                s += c;
            } else {
                s += c;
            }
        }
        return s;
    }
}