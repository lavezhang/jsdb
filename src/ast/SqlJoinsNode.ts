///<reference path="SqlNode.ts"/>
/**
 * joins节点。
 */
class SqlJoinsNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlJoinsNode(null, null, null);
    }
}