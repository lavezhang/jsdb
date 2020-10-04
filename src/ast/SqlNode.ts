///<reference path="../SqlContext.ts"/>
/**
 * SQL语法节点基类。
 */
class SqlNode {

    /**
     * 构造函数。
     * @param parent 父节点。
     * @param value 节点值
     * @param line 所在行号（从1开始）。
     */
    protected constructor(parent: SqlNode, value: string, line: number) {
        this.parent = parent;
        if (parent) {
            parent.nodes.push(this);
        }
        this.value = value;
        this.line = line;
        this.nodes = [];
    }

    public value: string;
    public line: number;
    public parent: SqlNode;
    public nodes: Array<SqlNode>;

    /**
     * 创建相同类型的实例。
     */
    public create(): SqlNode {
        return new SqlNode(null, null, null);
    }

    /**
     * 深度克隆该节点。
     */
    public clone(): SqlNode {
        let node = this.create();

        node.parent = this.parent;
        node.value = this.value;
        node.line = this.line;

        for (let i in this.nodes) {
            var subNode = this.nodes[i].clone();
            if (subNode.parent) {
                let j = subNode.parent.nodes.indexOf(subNode);
                if (j >= 0) {
                    subNode.parent.nodes.splice(j, 1);
                }
            }
            subNode.parent = node;
            node.nodes.push(subNode);
        }
        return node;
    }

    /**
     * 返回节点的字符串表示。
     */
    public toSql(): string {
        if (this.nodes.length == 0) {
            return this.value;
        } else if (this.nodes.length == 1) {
            if (this.value == '+' || this.value == '-') {
                return this.value + this.nodes[0].toSql();
            }
            return (this.value + ' ' + this.nodes[0].toSql()).trim();
        } else if (this.nodes.length == 2) {
            return this.nodes[0].toSql() + ' ' + this.value + ' ' + this.nodes[1].toSql();
        } else {
            let buf = '';
            for (let i = 0; i < this.nodes.length; i++) {
                buf += this.nodes[i].toSql();
                if (i < this.nodes.length - 1) {
                    buf += this.value;
                    if (this.value.indexOf(' ') < 0) {
                        buf += ' ';
                    }
                }
            }
            return buf;
        }
    }

    /**
     * 返回节点的树形结构字符串表示。
     */
    public toString(): string {
        let buf = '';
        buf += "|--" + this.constructor['name'] + '@' + this.line + "：" + this.value;
        for (let i in this.nodes) {
            let node = this.nodes[i];
            let lines = node.toString().split('\n');
            for (let j in lines) {
                if (lines[j].length > 0) {
                    buf += "\n    " + lines[j];
                }
            }
        }
        return buf;
    }

    /**
     * 类型推导。
     * @param ctx 上下文。
     */
    public typeDeriva(ctx: SqlContext): SqlColumnType {
        return SqlColumnType.varchar;
    }

    /**
     * 计算节点的值。
     * @param ctx 上下文。
     */
    public compute(ctx: SqlContext): any {
        return null;
    }

}