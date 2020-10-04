///<reference path="SqlNode.ts"/>
/**
 * 字段声明节点。
 */
class SqlFieldDeclareNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlFieldDeclareNode(null, null, null);
    }
}