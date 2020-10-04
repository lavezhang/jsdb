///<reference path="SqlNode.ts"/>
/**
 * 条件与节点(and)。
 */
class SqlExpAndNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlExpAndNode(null, null, null);
    }

    public toSql(): string {
        let buf = '';
        if (this.nodes[0] instanceof SqlExpOrNode) {
            buf += '(' + this.nodes[0].toSql() + ')';
        } else {
            buf += this.nodes[0].toSql();
        }

        buf += ' ' + this.value + ' ';

        if (this.nodes[1] instanceof SqlExpOrNode) {
            buf += '(' + this.nodes[1].toSql() + ')';
        } else {
            buf += this.nodes[1].toSql();
        }

        return buf;
    }

    public typeDeriva(ctx: SqlContext): SqlColumnType {
        return SqlColumnType.number;
    }

    public compute(ctx: SqlContext): any {
        let left = this.nodes[0].compute(ctx);
        if (left instanceof SqlError) {
            return left;
        }
        let right = this.nodes[1].compute(ctx);
        if (right instanceof SqlError) {
            return right;
        }
        if (typeof left == 'boolean' && typeof right == 'boolean') {
            return left && right;
        }
        return false;
    }
}