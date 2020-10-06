///<reference path="SqlNode.ts"/>
/**
 * select节点。
 */
class SqlSelectNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlSelectNode(null, null, null);
    }

    public toSql(): string {
        let buf = 'select ';
        for (let i = 0; i < this.nodes.length; i++) {
            buf += this.nodes[i].toSql();
            if (i < this.nodes.length - 1) {
                buf += ' ';
            }
        }
        return buf;
    }

    public isDistinct(): boolean {
        return this.nodes.length > 0 && this.nodes[0] instanceof SqlModifiersNode && this.nodes[0].value == 'distinct';
    }

    public getFieldNodes(): SqlFieldNode[] {
        for (let i in this.nodes) {
            if (this.nodes[i] instanceof SqlFieldsNode) {
                return this.nodes[i].nodes;
            }
        }
        return null;
    }

    public getFromTableNode(): SqlTableNode {
        for (let i in this.nodes) {
            if (this.nodes[i] instanceof SqlFromNode) {
                return this.nodes[i].nodes[0];
            }
        }
        return null;
    }

    public getJoinNodes(): SqlJoinNode[] {
        for (let i in this.nodes) {
            if (this.nodes[i] instanceof SqlJoinsNode) {
                return this.nodes[i].nodes;
            }
        }
        return [];
    }

    public getWhereExpNode(): SqlNode {
        for (let i in this.nodes) {
            if (this.nodes[i] instanceof SqlWhereNode) {
                return this.nodes[i].nodes[0];
            }
        }
        return null;
    }

    public getGroupByNode(): SqlGroupByNode {
        for (let i in this.nodes) {
            if (this.nodes[i] instanceof SqlGroupByNode) {
                return this.nodes[i];
            }
        }
        return null;
    }

    public getHavingNode(): SqlHavingNode {
        for (let i in this.nodes) {
            if (this.nodes[i] instanceof SqlHavingNode) {
                return this.nodes[i];
            }
        }
        return null;
    }

    public getOrderByNode(): SqlOrderByNode {
        for (let i in this.nodes) {
            if (this.nodes[i] instanceof SqlOrderByNode) {
                return this.nodes[i];
            }
        }
        return null;
    }

    public getLimitNode(): SqlLimitNode {
        for (let i in this.nodes) {
            if (this.nodes[i] instanceof SqlLimitNode) {
                return this.nodes[i];
            }
        }
        return null;
    }

    public compute(ctx: SqlContext): any {
        ctx.selectNode = this;

        //主表
        let fromTableName = this.getFromTableNode().nodes[0].value;
        let fromTableAlias = this.getFromTableNode().value;
        if (fromTableAlias) {
            ctx.tableAliasMap[fromTableAlias] = fromTableName;
            ctx.tableAliasMap[fromTableName] = fromTableAlias;
        }
        let fromTable: SqlDataTable = ctx.database.tables[fromTableName];
        if (!fromTable) {
            return new SqlError('不存在指定的主表：' + fromTableName, this.getFromTableNode().line);
        }

        let tableList = new Array<SqlDataTable>();
        tableList.push(fromTable);

        //构造宽表的结构
        let fullTable = new SqlDataTable('__full__');
        for (let j = 0; j < fromTable.columnNames.length; j++) {
            let col = fromTable.getColumnByIndex(j);
            fullTable.addColumn((fromTableAlias ? fromTableAlias : fromTableName) + '.' + col.name, col.type);
        }
        let joinNodes = this.getJoinNodes();
        for (let k = 0; k < joinNodes.length; k++) {
            let joinNode = joinNodes[k];
            let joinTableNode = joinNode.nodes[0];
            let joinTableName = joinTableNode.nodes[0].value;
            let joinTableAlias = joinTableNode.value;
            if (joinTableAlias && joinTableAlias == fromTableName) {
                return new SqlError('联结表别名与主表名冲突。', joinTableNode.line);
            }
            if (joinTableAlias && joinTableAlias == fromTableAlias) {
                return new SqlError('联结表别名与主表别名冲突。', joinTableNode.line);
            }
            if (!joinTableAlias && joinTableName == fromTableName) {
                return new SqlError('联结表名与主表名冲突，必须指定别名。', joinTableNode.line);
            }
            if (!joinTableAlias && joinTableName == fromTableAlias) {
                return new SqlError('联结表名与主表别名冲突，必须指定别名。', joinTableNode.line);
            }

            if (joinTableAlias) {
                ctx.tableAliasMap[joinTableAlias] = joinTableName;
                ctx.tableAliasMap[joinTableName] = joinTableAlias;
            }
            let joinTable: SqlDataTable = ctx.database.tables[joinTableName];
            if (!joinTable) {
                return new SqlError('不存在指定的联结表：' + joinTableName, joinTableNode.line);
            }
            for (let j = 0; j < joinTable.columnNames.length; j++) {
                let col = joinTable.getColumnByIndex(j);
                fullTable.addColumn((joinTableAlias ? joinTableAlias : joinTableName) + '.' + col.name, col.type);
            }
            tableList.push(joinTable);
        }

        //构造宽表的数据
        let fullTableRowCount = tableList[0].rows.length;
        for (let i = 1; i < tableList.length; i++) {
            fullTableRowCount *= tableList[i].rows.length;
        }
        for (let i = 0; i < fullTableRowCount; i++) {
            fullTable.addDataRow(fullTable.newRow());
        }
        if (fullTableRowCount > 0) {
            let joinTableRowCount = fullTableRowCount;
            let colStart = 0;
            for (let i = 0; i < tableList.length; i++) {
                let table = tableList[i];
                joinTableRowCount /= table.rows.length;
                let rowIndex = 0;
                while (rowIndex < fullTableRowCount) {
                    for (let j = 0; j < table.rows.length; j++) {
                        for (let k = 0; k < joinTableRowCount; k++) {
                            for (let m = 0; m < table.columnNames.length; m++) {
                                fullTable.setValueByIndex(rowIndex, colStart + m, table.rows[j].values[m]);
                            }
                            if (i == 0) {//from table
                                fullTable.rows[rowIndex].id = table.rows[j].id;
                            }
                            rowIndex++;
                        }
                    }
                }
                colStart += table.columnNames.length;
            }
        }
        ctx.dataTable = fullTable;

        //join筛选
        if (joinNodes.length > 0) {
            let filteredRowIndexSet = [];
            for (let i = fullTable.rows.length - 1; i >= 0; i--) {
                ctx.rowIndex = i;
                let joinFaildCount = 0;
                for (let k = 0; k < joinNodes.length; k++) {
                    let joinNode = joinNodes[k];
                    let joinTableNode = joinNode.nodes[0];
                    let joinOnNode = joinNode.nodes[1];
                    let v = joinOnNode.compute(ctx);
                    if (v instanceof SqlError) {
                        return v;
                    }
                    if (v != true) {
                        if (joinNode.value == 'join') {
                            joinFaildCount = joinNodes.length + 1;//must be deleted
                        } else {//left join
                            joinFaildCount++;
                        }

                        //没join上的字段设置为null值
                        for (let j = 0; j < fullTable.columnNames.length; j++) {
                            let colTableName = fullTable.columnNames[j].split('.')[0];
                            if (colTableName == joinTableNode.value || colTableName == joinTableNode.nodes[0].value) {
                                fullTable.setValueByIndex(i, j, null);
                            }
                        }
                    }
                }
                let rid = fullTable.rows[i].id;
                if (typeof filteredRowIndexSet[rid] == 'undefined') {
                    filteredRowIndexSet[rid] = {rowIndex: i, failures: joinFaildCount, repeatJoinRows: []};
                } else if (joinFaildCount < filteredRowIndexSet[rid].failures) {
                    filteredRowIndexSet[rid].rowIndex = i;
                    filteredRowIndexSet[rid].failures = joinFaildCount;
                } else if (joinFaildCount == 0) {
                    if (filteredRowIndexSet[rid].failures == 0) {
                        filteredRowIndexSet[rid].repeatJoinRows.push(fullTable.rows[i]);
                    } else {
                        filteredRowIndexSet[rid].rowIndex = i;
                        filteredRowIndexSet[rid].failures = joinFaildCount;
                    }
                }
                // if ((joinFaildCount == 0 || typeof filteredRowIndexSet[fullTable.rows[i].id] == 'undefined')
                //     || joinFaildCount < filteredRowIndexSet[fullTable.rows[i].id].failures) {
                //     filteredRowIndexSet[fullTable.rows[i].id] = {rowIndex: i, failures: joinFaildCount};
                // }
            }

            //删除未join上的行
            for (let i = fullTable.rows.length - 1; i >= 0; i--) {
                let r = filteredRowIndexSet[fullTable.rows[i].id];
                if (r.failures > joinNodes.length) {
                    fullTable.deleteRow(i);
                    continue;
                }
                if (r.rowIndex == i) {
                    continue;
                }
                let needDelete = true;
                for (let k = 0; k < r.repeatJoinRows.length; k++) {
                    if (r.repeatJoinRows[k] == fullTable.rows[i]) {
                        needDelete = false;
                        break;
                    }
                }
                if (needDelete) {
                    fullTable.deleteRow(i);
                }
            }
        }

        //where筛选
        let whereExpNode = this.getWhereExpNode();
        if (whereExpNode) {
            for (let i = fullTable.rows.length - 1; i >= 0; i--) {
                ctx.rowIndex = i;
                if (whereExpNode) {
                    let v = whereExpNode.compute(ctx);
                    if (v instanceof SqlError) {
                        return v;
                    }
                    if (v != true) {
                        fullTable.deleteRow(i);
                    }
                }
            }
        }

        //构造结果表的结构
        let resultTable = new SqlDataTable('__result__');
        let fieldExpNodes = [];
        let fieldNodes = this.getFieldNodes();
        for (let j = 0; j < fieldNodes.length; j++) {
            let fieldNode = fieldNodes[j];
            let fieldExpNode = fieldNode.nodes[0];
            let colName = fieldNode.value;
            let colType = fieldExpNode.typeDeriva(ctx);
            if (!colName) {
                if (fieldExpNode instanceof SqlIdentityNode || fieldExpNode instanceof SqlExpRefNode || fieldExpNode instanceof SqlStarNode) {
                    colName = fieldExpNode.value;
                } else {
                    colName = fieldExpNode.toSql();
                }
            }
            if (colName == '*') {
                for (let k = 0; k < fullTable.columnNames.length; k++) {
                    let c = fullTable.getColumnByIndex(k);
                    resultTable.addColumn(c.name, c.type);
                    fieldExpNodes.push(new SqlExpRefNode(null, c.name, fieldNode.line));
                }
            } else if (colName.substr(colName.length - 2) == '.*') {
                for (let k = 0; k < fullTable.columnNames.length; k++) {
                    let c = fullTable.getColumnByIndex(k);
                    let tName1 = colName.split('.')[0];
                    if (c.name.split('.')[0] == tName1) {
                        resultTable.addColumn(c.name, c.type);
                        fieldExpNodes.push(new SqlExpRefNode(null, c.name, fieldNode.line));
                    } else {
                        let tName2 = ctx.tableAliasMap[tName1];
                        if (tName1 && c.name.split('.')[0] == tName2) {
                            resultTable.addColumn(c.name, c.type);
                            fieldExpNodes.push(new SqlExpRefNode(null, c.name, fieldNode.line));
                        }
                    }
                }
            } else if (colName.indexOf('.') > 0) {
                resultTable.addColumn(colName, colType);
                fieldExpNodes.push(fieldExpNode);
            } else {
                resultTable.addColumn(colName, colType);
                fieldExpNodes.push(fieldExpNode);
            }
        }

        //分组
        let groupByNode = this.getGroupByNode();
        let havingNode = this.getHavingNode();
        let orderByNode = this.getOrderByNode();

        //找出用到的所有聚合表达式
        let funcNodeList: SqlExpFuncNode[] = [];
        for (let j = 0; j < fieldNodes.length; j++) {
            this.loadAggregateFunctions(fieldNodes[j], funcNodeList);
        }
        if (havingNode) {
            this.loadAggregateFunctions(havingNode, funcNodeList);
        }
        if (orderByNode) {
            this.loadAggregateFunctions(orderByNode, funcNodeList);
        }
        let funcNodeCount = 0;
        for (let m in funcNodeList) {
            funcNodeCount++;
        }

        if (groupByNode || funcNodeCount > 0) {
            //构造分组中间表
            let t = new SqlDataTable('__group__');
            if (groupByNode) {
                for (let k = 0; k < groupByNode.nodes.length; k++) {
                    let gNode = groupByNode.nodes[k];
                    let col = t.addColumn(gNode.toSql(), gNode.typeDeriva(ctx));
                    if (col) {
                        col.node = gNode;
                    }
                }
            }
            for (let i in funcNodeList) {
                let fNode = funcNodeList[i];
                let col = t.addColumn(fNode.toSql(), fNode.typeDeriva(ctx));
                if (col) {
                    col.node = fNode;
                }
            }
            ctx.groupByMidTable = t;

            //计算分组中间表的数据
            for (let i = 0; i < fullTable.rows.length; i++) {
                ctx.rowIndex = i;
                for (let j = 0; j < t.columnNames.length; j++) {
                    let col = t.getColumnByIndex(j);
                    let expNode = col.node;
                    let v = expNode.compute(ctx);
                    if (v instanceof SqlError) {
                        return v;
                    }
                }
            }
            ctx.isGroupByMidTableFinished = true;
            ctx.dataTable = ctx.groupByMidTable;

            //计算结果表的数据
            for (let i = 0; i < ctx.dataTable.rows.length; i++) {
                ctx.rowIndex = i;
                if (havingNode) {
                    let hv = havingNode.compute(ctx);
                    if (hv instanceof SqlError) {
                        return hv;
                    }
                    if (hv != true) {
                        continue;
                    }
                }
                let rowValues = [];
                for (let j = 0; j < fieldExpNodes.length; j++) {
                    let fNode = fieldExpNodes[j];
                    let fCol = ctx.dataTable.getColumnByName(fNode.toSql());
                    if (fCol) {
                        let fVal = ctx.dataTable.rows[i].values[fCol.index];
                        if (fVal instanceof SqlGroupByValue) {
                            fVal = fVal.value;
                        }
                        rowValues.push(fVal);
                    } else {
                        let v = fNode.compute(ctx);
                        if (v instanceof SqlError) {
                            return v;
                        }
                        rowValues.push(v);
                    }
                }
                resultTable.addRow(rowValues);
            }
        } else {
            //计算结果表的数据
            for (let i = 0; i < ctx.dataTable.rows.length; i++) {
                ctx.rowIndex = i;
                let rowValues = [];
                for (let j = 0; j < fieldExpNodes.length; j++) {
                    let v = fieldExpNodes[j].compute(ctx);
                    if (v instanceof SqlError) {
                        return v;
                    }
                    rowValues.push(v);
                }
                resultTable.addRow(rowValues);
            }
        }

        //排序
        if (orderByNode && orderByNode.nodes.length > 0) {
            //计算每一行的排序值
            let rows = resultTable.rows;
            for (let i = 0; i < rows.length; i++) {
                ctx.rowIndex = i;
                let row = rows[i];
                for (let m = 0; m < orderByNode.nodes.length; m++) {
                    let oVal = orderByNode.nodes[m].nodes[0].compute(ctx);
                    if (oVal instanceof SqlError) {
                        return oVal;
                    }
                    row.orderByValues.push(oVal);
                }
            }

            //计算每个排序项的方向
            let directions: boolean[] = [];
            for (let k = 0; k < orderByNode.nodes.length; k++) {
                directions.push(orderByNode.nodes[k].value == 'desc');
            }

            //对数据行进行排序
            rows.sort(function (a: SqlDataRow, b: SqlDataRow) {
                let m = 0;
                while (m < directions.length) {
                    if (a.orderByValues[m] == b.orderByValues[m]) {
                        m++;
                    } else {
                        if (directions[m]) {//desc
                            return a.orderByValues[m] < b.orderByValues[m] ? 1 : -1;
                        } else {
                            return a.orderByValues[m] > b.orderByValues[m] ? 1 : -1;
                        }
                    }
                }
                return 0;
            });
        }

        //分页
        let limitNode = this.getLimitNode();
        if (limitNode) {
            let limitNums = [];
            for (let i = 0; i < limitNode.nodes.length; i++) {
                let v = limitNode.nodes[i].compute(ctx);
                if (v instanceof SqlError) {
                    return v;
                }
                if (typeof v != 'number') {
                    return new SqlError('无效的limit值：' + v, limitNode.line);
                }
                limitNums.push(v);
            }
            if (limitNums.length == 1) {
                let end = limitNums[0];
                if (resultTable.rows.length > end) {
                    resultTable.rows.splice(end, resultTable.rows.length - end);
                }
            } else if (limitNums.length == 2) {
                let begin = limitNums[0];
                let end = limitNums[0] + limitNums[1] - 1;
                resultTable.rows.splice(end + 1, resultTable.rows.length - end - 1);
                resultTable.rows.splice(0, begin);
            }
        }

        return resultTable;
    }

    /**
     * 加载聚合函数节点。
     * @param node 当前节点。
     * @param funcNodeList 聚合函数节点。
     */
    private loadAggregateFunctions(node: SqlNode, funcNodeList: SqlExpFuncNode[]) {
        if (!node) {
            return;
        }
        for (let i = 0; i < node.nodes.length; i++) {
            this.loadAggregateFunctions(node.nodes[i], funcNodeList);
        }
        if (node instanceof SqlExpFuncNode && node.isAggregate()) {
            let k = node.toSql();
            if (!funcNodeList[k]) {
                funcNodeList[k] = node;
            }
        }
    }
}