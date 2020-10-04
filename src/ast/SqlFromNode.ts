///<reference path="SqlNode.ts"/>
/**
 * from节点。
 */
class SqlFromNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlFromNode(null, null, null);
    }
}