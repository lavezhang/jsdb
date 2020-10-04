///<reference path="SqlDataTable.ts"/>
///<reference path="SqlParser.ts"/>

/**
 * SQL数据库。
 */
class SqlDatabase {
    /**
     * 数据集包含的数据表。
     */
    public tables: SqlDataTable[] = [];

    /**
     * 数据集包含的数据表的名称。
     */
    public tableNames: string[] = [];

    /**
     * 数据集包含的数据表的数量。
     */
    public tableCount: number = 0;

    /**
     * 向数据集添加指定的数据表。
     * @param table
     */
    public addTable(table: SqlDataTable): SqlDataTable {
        if (!table || !table.name || table.columnNames.length <= 0 || this.tables[table.name]) {
            return null;
        }
        this.tables[table.name] = table;
        this.tableCount++;
        this.tableNames.push(table.name);
        return table;
    }

    /**
     * 执行SQL语句。
     * @param sql 要执行的SQL语句。
     * @param parameters 动态参数。
     * @return select语句返回SqlDataTable，其它语句返回受影响行数，如果失败则返回SqlError。
     */
    public execute(sql: string, parameters: any[] = []): SqlDataTable | number | SqlError {
        if (!sql) {
            return new SqlError('要执行的SQL为空。', 1);
        }

        let parser = new SqlParser(sql);
        let firstToken = parser.peek();
        if (!firstToken) {
            return new SqlError('要执行的SQL为空。', 1);
        }
        let secondToken = parser.peekNext();
        if (!secondToken) {
            return new SqlError('要执行的SQL无效。', 1);
        }

        let ctx = new SqlContext();
        ctx.database = this;
        ctx.parameters = parameters;

        if (firstToken[0] == TK_SELECT) {
            let node = parser.parseSelectNode(null);
            if (parser.errors.length > 0) {
                return parser.errors[0];
            }
            if (!node) {
                return new SqlError('select语句无效。', firstToken[2]);
            }
            return node.compute(ctx);
        } else if (firstToken[0] == TK_INSERT) {
            let node = parser.parseInsertNode(null);
            if (parser.errors.length > 0) {
                return parser.errors[0];
            }
            if (!node) {
                return new SqlError('insert语句无效。', firstToken[2]);
            }
            return node.compute(ctx);
        } else if (firstToken[0] == TK_UPDATE) {
            let node = parser.parseUpdateNode(null);
            if (parser.errors.length > 0) {
                return parser.errors[0];
            }
            if (!node) {
                return new SqlError('update语句无效。', firstToken[2]);
            }
            return node.compute(ctx);
        } else if (firstToken[0] == TK_DELETE) {
            let node = parser.parseDeleteNode(null);
            if (parser.errors.length > 0) {
                return parser.errors[0];
            }
            if (!node) {
                return new SqlError('delete语句无效。', firstToken[2]);
            }
            return node.compute(ctx);
        } else if (firstToken[0] == TK_CREATE && secondToken[0] == TK_TABLE) {
            let node = parser.parseCreateTableNode(null);
            if (parser.errors.length > 0) {
                return parser.errors[0];
            }
            if (!node) {
                return new SqlError('create table语句无效。', firstToken[2]);
            }
            return node.compute(ctx);
        }
        return new SqlError('无法识别指定的SQL。', firstToken[2]);
    }
}