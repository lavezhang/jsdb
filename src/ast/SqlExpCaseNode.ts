///<reference path="SqlNode.ts"/>
/**
 * case节点。
 */
class SqlExpCaseNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlExpCaseNode(null, null, null);
    }

    public toSql(): string {
        let buf = this.value;
        for (let i = 0; i < this.nodes.length - 1; i += 2) {
            buf += ' when ' + this.nodes[i].toSql();
            buf += ' then ' + this.nodes[i + 1].toSql();
        }
        if (this.nodes.length % 2 == 1) {
            buf += ' else ' + this.nodes[this.nodes.length - 1].toSql();
        }
        buf += ' end';
        return buf;
    }

    public typeDeriva(ctx: SqlContext): SqlColumnType {
        return this.nodes[1].typeDeriva(ctx);
    }

    public compute(ctx: SqlContext): any {
        for (let i = 0; i < this.nodes.length - 1; i += 2) {
            let whenValue = this.nodes[i].compute(ctx);
            if (whenValue instanceof SqlError) {
                return whenValue;
            }
            let thenValue = this.nodes[i + 1].compute(ctx);
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
    }
}