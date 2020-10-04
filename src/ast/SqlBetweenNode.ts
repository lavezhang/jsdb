///<reference path="SqlNode.ts"/>
/**
 * between节点。
 */
class SqlBetweenNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlBetweenNode(null, null, null);
    }

    public typeDeriva(ctx: SqlContext): SqlColumnType {
        return SqlColumnType.number;
    }

    public compute(ctx: SqlContext): any {
        let value = this.nodes[0].compute(ctx);
        if (value instanceof SqlError) {
            return value;
        }
        let range = this.nodes[1].compute(ctx);
        if (range instanceof SqlError || !range) {
            return range;
        }
        let left = range[0];
        let right = range[1];
        if (value == null || left == null || right == null) {
            return false;
        }
        if (typeof value == 'number') {
            if (typeof left == 'string') {
                left = parseFloat(left);
            }
            if (typeof right == 'string') {
                right = parseFloat(right);
            }
            return value >= left && value <= right;
        } else {
            value = value + '';
            left = left + '';
            right = right + '';
            return value >= left && value <= right;
        }
    }
}