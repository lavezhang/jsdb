///<reference path="SqlNode.ts"/>
/**
 * 乘除节点。
 */
class SqlExpMulNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlExpMulNode(null, null, null);
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
        if (typeof left == 'number' && typeof right == 'number') {
            if (this.value == '*') {
                return left * right;
            } else if (this.value == '/') {
                return right != 0 ? (left / right) : null;
            } else if (this.value == '%') {
                return right != 0 ? (left % right) : null;
            }
        }
        return null;
    }
}