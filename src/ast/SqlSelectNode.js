var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
///<reference path="SqlNode.ts"/>
/**
 * select节点。
 */
var SqlSelectNode = /** @class */ (function (_super) {
    __extends(SqlSelectNode, _super);
    function SqlSelectNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlSelectNode.prototype.create = function () {
        return new SqlSelectNode(null, null, null);
    };
    SqlSelectNode.prototype.toSql = function () {
        var buf = 'select ';
        for (var i = 0; i < this.nodes.length; i++) {
            buf += this.nodes[i].toSql();
            if (i < this.nodes.length - 1) {
                buf += ' ';
            }
        }
        return buf;
    };
    SqlSelectNode.prototype.isDistinct = function () {
        return this.nodes.length > 0 && this.nodes[0] instanceof SqlModifiersNode && this.nodes[0].value == 'distinct';
    };
    SqlSelectNode.prototype.getFieldNodes = function () {
        for (var i in this.nodes) {
            if (this.nodes[i] instanceof SqlFieldsNode) {
                return this.nodes[i].nodes;
            }
        }
        return null;
    };
    SqlSelectNode.prototype.getFromTableNode = function () {
        for (var i in this.nodes) {
            if (this.nodes[i] instanceof SqlFromNode) {
                return this.nodes[i].nodes[0];
            }
        }
        return null;
    };
    SqlSelectNode.prototype.getJoinNodes = function () {
        for (var i in this.nodes) {
            if (this.nodes[i] instanceof SqlJoinsNode) {
                return this.nodes[i].nodes;
            }
        }
        return [];
    };
    SqlSelectNode.prototype.getWhereExpNode = function () {
        for (var i in this.nodes) {
            if (this.nodes[i] instanceof SqlWhereNode) {
                return this.nodes[i].nodes[0];
            }
        }
        return null;
    };
    SqlSelectNode.prototype.getGroupByNode = function () {
        for (var i in this.nodes) {
            if (this.nodes[i] instanceof SqlGroupByNode) {
                return this.nodes[i];
            }
        }
        return null;
    };
    SqlSelectNode.prototype.getHavingNode = function () {
        for (var i in this.nodes) {
            if (this.nodes[i] instanceof SqlHavingNode) {
                return this.nodes[i];
            }
        }
        return null;
    };
    SqlSelectNode.prototype.getOrderByNode = function () {
        for (var i in this.nodes) {
            if (this.nodes[i] instanceof SqlOrderByNode) {
                return this.nodes[i];
            }
        }
        return null;
    };
    SqlSelectNode.prototype.getLimitNode = function () {
        for (var i in this.nodes) {
            if (this.nodes[i] instanceof SqlLimitNode) {
                return this.nodes[i];
            }
        }
        return null;
    };
    SqlSelectNode.prototype.compute = function (ctx) {
        ctx.selectNode = this;
        //主表
        var fromTableName = this.getFromTableNode().nodes[0].value;
        var fromTableAlias = this.getFromTableNode().value;
        if (fromTableAlias) {
            ctx.tableAliasMap[fromTableAlias] = fromTableName;
            ctx.tableAliasMap[fromTableName] = fromTableAlias;
        }
        var fromTable = ctx.database.tables[fromTableName];
        if (!fromTable) {
            return new SqlError('不存在指定的主表：' + fromTableName, this.getFromTableNode().line);
        }
        var tableList = new Array();
        tableList.push(fromTable);
        //构造宽表的结构
        var fullTable = new SqlDataTable('__full__');
        for (var j = 0; j < fromTable.columnNames.length; j++) {
            var col = fromTable.getColumnByIndex(j);
            fullTable.addColumn((fromTableAlias ? fromTableAlias : fromTableName) + '.' + col.name, col.type);
        }
        var joinNodes = this.getJoinNodes();
        for (var k = 0; k < joinNodes.length; k++) {
            var joinNode = joinNodes[k];
            var joinTableNode = joinNode.nodes[0];
            var joinTableName = joinTableNode.nodes[0].value;
            var joinTableAlias = joinTableNode.value;
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
            var joinTable = ctx.database.tables[joinTableName];
            if (!joinTable) {
                return new SqlError('不存在指定的联结表：' + joinTableName, joinTableNode.line);
            }
            for (var j = 0; j < joinTable.columnNames.length; j++) {
                var col = joinTable.getColumnByIndex(j);
                fullTable.addColumn((joinTableAlias ? joinTableAlias : joinTableName) + '.' + col.name, col.type);
            }
            tableList.push(joinTable);
        }
        //构造宽表的数据
        var fullTableRowCount = tableList[0].rows.length;
        for (var i = 1; i < tableList.length; i++) {
            fullTableRowCount *= tableList[i].rows.length;
        }
        for (var i = 0; i < fullTableRowCount; i++) {
            fullTable.addDataRow(fullTable.newRow());
        }
        if (fullTableRowCount > 0) {
            var joinTableRowCount = fullTableRowCount;
            var colStart = 0;
            for (var i = 0; i < tableList.length; i++) {
                var table = tableList[i];
                joinTableRowCount /= table.rows.length;
                var rowIndex = 0;
                while (rowIndex < fullTableRowCount) {
                    for (var j = 0; j < table.rows.length; j++) {
                        for (var k = 0; k < joinTableRowCount; k++) {
                            for (var m = 0; m < table.columnNames.length; m++) {
                                fullTable.setValueByIndex(rowIndex, colStart + m, table.rows[j].values[m]);
                            }
                            if (i == 0) { //from table
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
            var filteredRowIndexSet = [];
            for (var i = fullTable.rows.length - 1; i >= 0; i--) {
                ctx.rowIndex = i;
                var joinFaildCount = 0;
                for (var k = 0; k < joinNodes.length; k++) {
                    var joinNode = joinNodes[k];
                    var joinTableNode = joinNode.nodes[0];
                    var joinOnNode = joinNode.nodes[1];
                    var v = joinOnNode.compute(ctx);
                    if (v instanceof SqlError) {
                        return v;
                    }
                    if (v != true) {
                        if (joinNode.value == 'join') {
                            joinFaildCount = joinNodes.length + 1; //must be deleted
                        }
                        else { //left join
                            joinFaildCount++;
                        }
                        //没join上的字段设置为null值
                        for (var j = 0; j < fullTable.columnNames.length; j++) {
                            var colTableName = fullTable.columnNames[j].split('.')[0];
                            if (colTableName == joinTableNode.value || colTableName == joinTableNode.nodes[0].value) {
                                fullTable.setValueByIndex(i, j, null);
                            }
                        }
                    }
                }
                var rid = fullTable.rows[i].id;
                if (typeof filteredRowIndexSet[rid] == 'undefined') {
                    filteredRowIndexSet[rid] = { rowIndex: i, failures: joinFaildCount, repeatJoinRows: [] };
                }
                else if (joinFaildCount < filteredRowIndexSet[rid].failures) {
                    filteredRowIndexSet[rid].rowIndex = i;
                    filteredRowIndexSet[rid].failures = joinFaildCount;
                }
                else if (joinFaildCount == 0) {
                    if (filteredRowIndexSet[rid].failures == 0) {
                        filteredRowIndexSet[rid].repeatJoinRows.push(fullTable.rows[i]);
                    }
                    else {
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
            for (var i = fullTable.rows.length - 1; i >= 0; i--) {
                var r = filteredRowIndexSet[fullTable.rows[i].id];
                if (r.failures > joinNodes.length) {
                    fullTable.deleteRow(i);
                    continue;
                }
                if (r.rowIndex == i) {
                    continue;
                }
                var needDelete = true;
                for (var k = 0; k < r.repeatJoinRows.length; k++) {
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
        var whereExpNode = this.getWhereExpNode();
        if (whereExpNode) {
            for (var i = fullTable.rows.length - 1; i >= 0; i--) {
                ctx.rowIndex = i;
                if (whereExpNode) {
                    var v = whereExpNode.compute(ctx);
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
        var resultTable = new SqlDataTable('__result__');
        var fieldExpNodes = [];
        var fieldNodes = this.getFieldNodes();
        for (var j = 0; j < fieldNodes.length; j++) {
            var fieldNode = fieldNodes[j];
            var fieldExpNode = fieldNode.nodes[0];
            var colName = fieldNode.value;
            var colType = fieldExpNode.typeDeriva(ctx);
            if (!colName) {
                if (fieldExpNode instanceof SqlIdentityNode || fieldExpNode instanceof SqlExpRefNode || fieldExpNode instanceof SqlStarNode) {
                    colName = fieldExpNode.value;
                }
                else {
                    colName = fieldExpNode.toSql();
                }
            }
            if (colName == '*') {
                for (var k = 0; k < fullTable.columnNames.length; k++) {
                    var c = fullTable.getColumnByIndex(k);
                    resultTable.addColumn(c.name, c.type);
                    fieldExpNodes.push(new SqlExpRefNode(null, c.name, fieldNode.line));
                }
            }
            else if (colName.substr(colName.length - 2) == '.*') {
                for (var k = 0; k < fullTable.columnNames.length; k++) {
                    var c = fullTable.getColumnByIndex(k);
                    var tName1 = colName.split('.')[0];
                    if (c.name.split('.')[0] == tName1) {
                        resultTable.addColumn(c.name, c.type);
                        fieldExpNodes.push(new SqlExpRefNode(null, c.name, fieldNode.line));
                    }
                    else {
                        var tName2 = ctx.tableAliasMap[tName1];
                        if (tName1 && c.name.split('.')[0] == tName2) {
                            resultTable.addColumn(c.name, c.type);
                            fieldExpNodes.push(new SqlExpRefNode(null, c.name, fieldNode.line));
                        }
                    }
                }
            }
            else if (colName.indexOf('.') > 0) {
                resultTable.addColumn(colName, colType);
                fieldExpNodes.push(fieldExpNode);
            }
            else {
                resultTable.addColumn(colName, colType);
                fieldExpNodes.push(fieldExpNode);
            }
        }
        //分组
        var groupByNode = this.getGroupByNode();
        var havingNode = this.getHavingNode();
        var orderByNode = this.getOrderByNode();
        //找出用到的所有聚合表达式
        var funcNodeList = [];
        for (var j = 0; j < fieldNodes.length; j++) {
            this.loadAggregateFunctions(fieldNodes[j], funcNodeList);
        }
        if (havingNode) {
            this.loadAggregateFunctions(havingNode, funcNodeList);
        }
        if (orderByNode) {
            this.loadAggregateFunctions(orderByNode, funcNodeList);
        }
        var funcNodeCount = 0;
        for (var m in funcNodeList) {
            funcNodeCount++;
        }
        if (groupByNode || funcNodeCount > 0) {
            //构造分组中间表
            var t = new SqlDataTable('__group__');
            if (groupByNode) {
                for (var k = 0; k < groupByNode.nodes.length; k++) {
                    var gNode = groupByNode.nodes[k];
                    var col = t.addColumn(gNode.toSql(), gNode.typeDeriva(ctx));
                    if (col) {
                        col.node = gNode;
                    }
                }
            }
            for (var i in funcNodeList) {
                var fNode = funcNodeList[i];
                var col = t.addColumn(fNode.toSql(), fNode.typeDeriva(ctx));
                if (col) {
                    col.node = fNode;
                }
            }
            ctx.groupByMidTable = t;
            //计算分组中间表的数据
            for (var i = 0; i < fullTable.rows.length; i++) {
                ctx.rowIndex = i;
                for (var j = 0; j < t.columnNames.length; j++) {
                    var col = t.getColumnByIndex(j);
                    var expNode = col.node;
                    var v = expNode.compute(ctx);
                    if (v instanceof SqlError) {
                        return v;
                    }
                }
            }
            ctx.isGroupByMidTableFinished = true;
            ctx.dataTable = ctx.groupByMidTable;
            //计算结果表的数据
            for (var i = 0; i < ctx.dataTable.rows.length; i++) {
                ctx.rowIndex = i;
                if (havingNode) {
                    var hv = havingNode.compute(ctx);
                    if (hv instanceof SqlError) {
                        return hv;
                    }
                    if (hv != true) {
                        continue;
                    }
                }
                var rowValues = [];
                for (var j = 0; j < fieldExpNodes.length; j++) {
                    var fNode = fieldExpNodes[j];
                    var fCol = ctx.dataTable.getColumnByName(fNode.toSql());
                    if (fCol) {
                        var fVal = ctx.dataTable.rows[i].values[fCol.index];
                        if (fVal instanceof SqlGroupByValue) {
                            fVal = fVal.value;
                        }
                        rowValues.push(fVal);
                    }
                    else {
                        var v = fNode.compute(ctx);
                        if (v instanceof SqlError) {
                            return v;
                        }
                        rowValues.push(v);
                    }
                }
                resultTable.addRow(rowValues);
            }
        }
        else {
            //计算结果表的数据
            for (var i = 0; i < ctx.dataTable.rows.length; i++) {
                ctx.rowIndex = i;
                var rowValues = [];
                for (var j = 0; j < fieldExpNodes.length; j++) {
                    var v = fieldExpNodes[j].compute(ctx);
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
            var rows = resultTable.rows;
            for (var i = 0; i < rows.length; i++) {
                ctx.rowIndex = i;
                var row = rows[i];
                for (var m = 0; m < orderByNode.nodes.length; m++) {
                    var oVal = orderByNode.nodes[m].nodes[0].compute(ctx);
                    if (oVal instanceof SqlError) {
                        return oVal;
                    }
                    row.orderByValues.push(oVal);
                }
            }
            //计算每个排序项的方向
            var directions_1 = [];
            for (var k = 0; k < orderByNode.nodes.length; k++) {
                directions_1.push(orderByNode.nodes[k].value == 'desc');
            }
            //对数据行进行排序
            rows.sort(function (a, b) {
                var m = 0;
                while (m < directions_1.length) {
                    if (a.orderByValues[m] == b.orderByValues[m]) {
                        m++;
                    }
                    else {
                        if (directions_1[m]) { //desc
                            return a.orderByValues[m] < b.orderByValues[m] ? 1 : -1;
                        }
                        else {
                            return a.orderByValues[m] > b.orderByValues[m] ? 1 : -1;
                        }
                    }
                }
                return 0;
            });
        }
        //分页
        var limitNode = this.getLimitNode();
        if (limitNode) {
            var limitNums = [];
            for (var i = 0; i < limitNode.nodes.length; i++) {
                var v = limitNode.nodes[i].compute(ctx);
                if (v instanceof SqlError) {
                    return v;
                }
                if (typeof v != 'number') {
                    return new SqlError('无效的limit值：' + v, limitNode.line);
                }
                limitNums.push(v);
            }
            if (limitNums.length == 1) {
                var end = limitNums[0];
                if (resultTable.rows.length > end) {
                    resultTable.rows.splice(end, resultTable.rows.length - end);
                }
            }
            else if (limitNums.length == 2) {
                var begin = limitNums[0];
                var end = limitNums[0] + limitNums[1] - 1;
                resultTable.rows.splice(end + 1, resultTable.rows.length - end - 1);
                resultTable.rows.splice(0, begin);
            }
        }
        return resultTable;
    };
    /**
     * 加载聚合函数节点。
     * @param node 当前节点。
     * @param funcNodeList 聚合函数节点。
     */
    SqlSelectNode.prototype.loadAggregateFunctions = function (node, funcNodeList) {
        if (!node) {
            return;
        }
        for (var i = 0; i < node.nodes.length; i++) {
            this.loadAggregateFunctions(node.nodes[i], funcNodeList);
        }
        if (node instanceof SqlExpFuncNode && node.isAggregate()) {
            var k = node.toSql();
            if (!funcNodeList[k]) {
                funcNodeList[k] = node;
            }
        }
    };
    return SqlSelectNode;
}(SqlNode));
