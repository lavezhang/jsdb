///<reference path="SqlNode.ts"/>
/**
 * 参数列表节点。
 */
class SqlParamsNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlParamsNode(null, null, null);
    }

    public toSql(): string {
        let buf = '(';
        for (let i = 0; i < this.nodes.length; i++) {
            buf += this.nodes[i].toSql();
            if (i < this.nodes.length - 1) {
                buf += ', ';
            }
        }
        buf += ')';
        return buf;
    }

    public compute(ctx: SqlContext): any {
        if (this.value == ',') {
            let list = [];
            for (let i = 0; i < this.nodes.length; i++) {
                let v = this.nodes[i].compute(ctx);
                if (v instanceof SqlError) {
                    return v;
                }
                list.push(v);
            }
            return list;
        }
        return null;
    }
}