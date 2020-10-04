///<reference path="SqlDataTable.ts"/>
///<reference path="SqlParser.ts"/>
/**
 * SQL数据库。
 */
var SqlDatabase = /** @class */ (function () {
    function SqlDatabase() {
        /**
         * 数据集包含的数据表。
         */
        this.tables = [];
        /**
         * 数据集包含的数据表的名称。
         */
        this.tableNames = [];
        /**
         * 数据集包含的数据表的数量。
         */
        this.tableCount = 0;
    }
    /**
     * 向数据集添加指定的数据表。
     * @param table
     */
    SqlDatabase.prototype.addTable = function (table) {
        if (!table || !table.name || table.columnNames.length <= 0 || this.tables[table.name]) {
            return null;
        }
        this.tables[table.name] = table;
        this.tableCount++;
        this.tableNames.push(table.name);
        return table;
    };
    /**
     * 执行SQL语句。
     * @param sql 要执行的SQL语句。
     * @param parameters 动态参数。
     * @return select语句返回SqlDataTable，其它语句返回受影响行数，如果失败则返回SqlError。
     */
    SqlDatabase.prototype.execute = function (sql, parameters) {
        if (parameters === void 0) { parameters = []; }
        if (!sql) {
            return new SqlError('要执行的SQL为空。', 1);
        }
        var parser = new SqlParser(sql);
        var firstToken = parser.peek();
        if (!firstToken) {
            return new SqlError('要执行的SQL为空。', 1);
        }
        var secondToken = parser.peekNext();
        if (!secondToken) {
            return new SqlError('要执行的SQL无效。', 1);
        }
        var ctx = new SqlContext();
        ctx.database = this;
        ctx.parameters = parameters;
        if (firstToken[0] == TK_SELECT) {
            var node = parser.parseSelectNode(null);
            if (parser.errors.length > 0) {
                return parser.errors[0];
            }
            if (!node) {
                return new SqlError('select语句无效。', firstToken[2]);
            }
            return node.compute(ctx);
        }
        else if (firstToken[0] == TK_INSERT) {
            var node = parser.parseInsertNode(null);
            if (parser.errors.length > 0) {
                return parser.errors[0];
            }
            if (!node) {
                return new SqlError('insert语句无效。', firstToken[2]);
            }
            return node.compute(ctx);
        }
        else if (firstToken[0] == TK_UPDATE) {
            var node = parser.parseUpdateNode(null);
            if (parser.errors.length > 0) {
                return parser.errors[0];
            }
            if (!node) {
                return new SqlError('update语句无效。', firstToken[2]);
            }
            return node.compute(ctx);
        }
        else if (firstToken[0] == TK_DELETE) {
            var node = parser.parseDeleteNode(null);
            if (parser.errors.length > 0) {
                return parser.errors[0];
            }
            if (!node) {
                return new SqlError('delete语句无效。', firstToken[2]);
            }
            return node.compute(ctx);
        }
        else if (firstToken[0] == TK_CREATE && secondToken[0] == TK_TABLE) {
            var node = parser.parseCreateTableNode(null);
            if (parser.errors.length > 0) {
                return parser.errors[0];
            }
            if (!node) {
                return new SqlError('create table语句无效。', firstToken[2]);
            }
            return node.compute(ctx);
        }
        return new SqlError('无法识别指定的SQL。', firstToken[2]);
    };
    return SqlDatabase;
}());
