///<reference path="SqlNode.ts"/>
///<reference path="../SqlGroupByValue.ts"/>
/**
 * 函数调用节点。
 */
class SqlExpFuncNode extends SqlNode {
    public constructor(parent: SqlNode, value: string, line: number) {
        super(parent, value, line);
    }

    public create(): SqlNode {
        return new SqlExpFuncNode(null, null, null);
    }

    public toSql(): string {
        if (this.nodes.length == 0) {
            return this.value + '()';
        } else if (this.nodes.length == 1) {
            return this.value + this.nodes[0].toSql();
        } else {
            let p = this.nodes[1].toSql();
            return this.value + '(' + this.nodes[0].toSql() + ' ' + p.substr(1, p.length - 2) + ')';
        }
    }

    public isAggregate(): boolean {
        return this.value == 'count' || this.value == 'sum' || this.value == 'max' || this.value == 'min' || this.value == 'avg';
    }

    public typeDeriva(ctx: SqlContext): SqlColumnType {
        if (this.value == 'len' || this.value == 'instr' || this.isAggregate()) {
            return SqlColumnType.number;
        }
        return SqlColumnType.varchar;
    }

    public compute(ctx: SqlContext): any {
        let fnName = this.value;
        let isDistinct = this.nodes.length > 1 && this.nodes[0] instanceof SqlModifiersNode && this.nodes[0].nodes[0].value == 'distinct';
        let paramNodes = isDistinct ? this.nodes[1].nodes : (this.nodes.length > 0 ? this.nodes[0].nodes : []);

        //
        // 执行非聚合函数
        //
        if (!this.isAggregate()) {
            let fn = ctx.standardFunctions['_' + fnName];
            if (!fn) {
                return new SqlError('不存在指定的函数：' + fnName, this.line);
            }

            //计算实参的值
            let fnArgs = [];
            for (let i = 0; i < paramNodes.length; i++) {
                let v = paramNodes[i].compute(ctx);
                if (v instanceof SqlError) {
                    return v;
                }
                fnArgs.push(v);
            }
            return fn(fnArgs);
        }

        //
        // 执行聚合函数
        //

        //检查分组中间表
        let t: SqlDataTable = ctx.groupByMidTable;
        if (!t) {
            return new SqlError('分组中间表未初始化。', this.line);
        }
        let k = this.toSql();
        let col = t.getColumnByName(k);
        if (!col) {
            return new SqlError('分组中间表中不存在指定的聚合列：' + k, this.line);
        }

        //检查分组中间表是否已完成，如果已完成，则可以直接取值
        if (ctx.isGroupByMidTableFinished) {
            let gv: SqlGroupByValue = t.getValueByIndex(ctx.rowIndex, col.index);
            return gv ? gv.value : null;
        }

        //分组中间表还没有完成，需要继续计算
        let fnArgs = [];
        for (let i = 0; i < paramNodes.length; i++) {
            let pNode = paramNodes[i];
            let v = null;
            if (pNode instanceof SqlStarNode) {
                v = 1;// TODO: 这里应该改为判断该行所有列是否都为null
            } else {
                v = pNode.compute(ctx);
            }
            if (v instanceof SqlError) {
                return v;
            }
            fnArgs.push(v);
        }
        if (fnArgs.length != 1) {
            return new SqlError('函数' + fnName + '的参数个数错误。', this.line);
        }
        let v = fnArgs[0];
        if (v == null) {
            return null;
        }

        //分组的中间数据行
        let groupByNode = ctx.selectNode.getGroupByNode();
        let groupByExpNodes = groupByNode ? groupByNode.nodes : [];
        let groupByValues = [];
        for (let i = 0; i < groupByExpNodes.length; i++) {
            let bv = groupByExpNodes[i].compute(ctx);
            if (bv instanceof SqlError) {
                return bv;
            }
            groupByValues.push(bv);
        }
        let r = t.addDataRow(new SqlDataRow(groupByValues, false));

        //分组计算
        let gv: SqlGroupByValue = r.values[col.index];
        if (!gv) {
            gv = new SqlGroupByValue();
            r.values[col.index] = gv;
        }
        if (fnName == 'count') {
            if (isDistinct) {
                v = v + '';
                if (!gv.distinctValues[v]) {
                    gv.distinctValues[v] = 1;
                    gv.value = gv.value == null ? 1 : gv.value + 1;
                }
            } else {
                gv.value = gv.value == null ? 1 : gv.value + 1;
            }
        } else if (fnName == 'sum') {
            gv.value = gv.value == null ? v : v + gv.value;
        } else if (fnName == 'max') {
            if (gv.value == null || v > gv.value) {
                gv.value = v;
            }
        } else if (fnName == 'min') {
            if (gv.value == null || v < gv.value) {
                gv.value = v;
            }
        } else if (fnName == 'avg') {
            gv.sum += v;
            gv.count++;
            gv.value = gv.sum / gv.count;
        }
        return null;
    }
}

