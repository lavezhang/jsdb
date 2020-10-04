///<reference path="SqlNode.ts"/>
/**
 * 一元操作符节点（正好、负号、not）。
 */
class SqlExpUnaryNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlExpUnaryNode(null, null, null);
    }

    public typeDeriva(ctx: SqlContext): SqlColumnType {
        return SqlColumnType.number;
    }

    public compute(ctx: SqlContext): any {
        let v = this.nodes[0].compute(ctx);
        if (typeof v == 'number') {
            if (this.value == '+') {
                return v;
            } else if (this.value == '-') {
                return -v;
            }
        } else if (typeof v == 'boolean') {
            return !v;
        }
        return null;
    }
}