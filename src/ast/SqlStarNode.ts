///<reference path="SqlNode.ts"/>
/**
 * 星号节点。
 */
class SqlStarNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlStarNode(null, null, null);
    }
}