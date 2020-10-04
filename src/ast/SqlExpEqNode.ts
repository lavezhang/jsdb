///<reference path="SqlNode.ts"/>
/**
 * 等于节点。
 */
class SqlExpEqNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlExpEqNode(null, null, null);
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
        if (this.value == '=') {
            return this.isEqual(ctx, left, right);
        } else if (this.value == '<>') {
            let v = this.isEqual(ctx, left, right);
            return !v;
        } else if (this.value == 'in') {
            return this.isIn(left, right);
        } else if (this.value == 'not in') {
            let v = this.isIn(left, right);
            return !v;
        } else if (this.value == 'is' && right == null) {
            return left == null;
        } else if (this.value == 'is not' && right == null) {
            return left != null;
        } else if (this.value == 'like') {
            return this.isLike(left, right);
        } else if (this.value == 'not like') {
            let v = this.isLike(left, right);
            if (v instanceof SqlError) {
                return v;
            }
            return !v;
        }
        return false;
    }

    private isEqual(ctx: SqlContext, left: any, right: any): boolean {
        if (left == null || right == null) {
            return false;
        }
        if (left == right) {
            return true;
        }
        return (left + '') == (right + '');
    }

    private isIn(left: any, right: any): boolean {
        if (left == null || right == null) {
            return false;
        }
        if (right instanceof Array) {
            for (let i = 0; i < right.length; i++) {
                if ((right[i] + '') == (left + '')) {
                    return true;
                }
            }
        }
        return false;
    }

    private isLike(left: any, right: any): boolean | SqlError {
        if (left == null || right == null) {
            return false;
        }
        let leftStr = left + '';
        let rightStr = right + '';
        let i = rightStr.indexOf('%');
        let j = rightStr.lastIndexOf('%');
        if (i == 0 && j == rightStr.length - 1) {
            return leftStr.indexOf(rightStr.substr(1, rightStr.length - 2)) >= 0;
        } else if (j == 0) {
            return leftStr.indexOf(rightStr.substr(0, rightStr.length - 1)) == 0;
        } else if (j == rightStr.length - 1) {
            return leftStr.indexOf(rightStr.substr(0, rightStr.length - 1)) == leftStr.length - rightStr.length - 1;
        } else {
            return new SqlError('暂不支持该匹配规则', this.line);
        }
    }
}