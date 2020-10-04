///<reference path="SqlNode.ts"/>
/**
 * 空值节点。
 */
class SqlNullNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlNullNode(null, null, null);
    }
}