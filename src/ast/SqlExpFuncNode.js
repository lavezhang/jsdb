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
///<reference path="../SqlGroupByValue.ts"/>
/**
 * 函数调用节点。
 */
var SqlExpFuncNode = /** @class */ (function (_super) {
    __extends(SqlExpFuncNode, _super);
    function SqlExpFuncNode(parent, value, line) {
        return _super.call(this, parent, value, line) || this;
    }
    SqlExpFuncNode.prototype.create = function () {
        return new SqlExpFuncNode(null, null, null);
    };
    SqlExpFuncNode.prototype.toSql = function () {
        if (this.nodes.length == 0) {
            return this.value + '()';
        }
        else if (this.nodes.length == 1) {
            return this.value + this.nodes[0].toSql();
        }
        else {
            var p = this.nodes[1].toSql();
            return this.value + '(' + this.nodes[0].toSql() + ' ' + p.substr(1, p.length - 2) + ')';
        }
    };
    SqlExpFuncNode.prototype.isAggregate = function () {
        return this.value == 'count' || this.value == 'sum' || this.value == 'max' || this.value == 'min' || this.value == 'avg';
    };
    SqlExpFuncNode.prototype.typeDeriva = function (ctx) {
        if (this.value == 'len' || this.value == 'instr' || this.isAggregate()) {
            return SqlColumnType.number;
        }
        return SqlColumnType.varchar;
    };
    SqlExpFuncNode.prototype.compute = function (ctx) {
        var fnName = this.value;
        var isDistinct = this.nodes.length > 1 && this.nodes[0] instanceof SqlModifiersNode && this.nodes[0].nodes[0].value == 'distinct';
        var paramNodes = isDistinct ? this.nodes[1].nodes : (this.nodes.length > 0 ? this.nodes[0].nodes : []);
        //
        // 执行非聚合函数
        //
        if (!this.isAggregate()) {
            var fn = ctx.standardFunctions['_' + fnName];
            if (!fn) {
                return new SqlError('不存在指定的函数：' + fnName, this.line);
            }
            //计算实参的值
            var fnArgs_1 = [];
            for (var i = 0; i < paramNodes.length; i++) {
                var v_1 = paramNodes[i].compute(ctx);
                if (v_1 instanceof SqlError) {
                    return v_1;
                }
                fnArgs_1.push(v_1);
            }
            return fn(fnArgs_1);
        }
        //
        // 执行聚合函数
        //
        //检查分组中间表
        var t = ctx.groupByMidTable;
        if (!t) {
            return new SqlError('分组中间表未初始化。', this.line);
        }
        var k = this.toSql();
        var col = t.getColumnByName(k);
        if (!col) {
            return new SqlError('分组中间表中不存在指定的聚合列：' + k, this.line);
        }
        //检查分组中间表是否已完成，如果已完成，则可以直接取值
        if (ctx.isGroupByMidTableFinished) {
            var gv_1 = t.getValueByIndex(ctx.rowIndex, col.index);
            return gv_1 ? gv_1.value : null;
        }
        //分组中间表还没有完成，需要继续计算
        var fnArgs = [];
        for (var i = 0; i < paramNodes.length; i++) {
            var pNode = paramNodes[i];
            var v_2 = null;
            if (pNode instanceof SqlStarNode) {
                v_2 = 1; // TODO: 这里应该改为判断该行所有列是否都不为null
            }
            else {
                v_2 = pNode.compute(ctx);
            }
            if (v_2 instanceof SqlError) {
                return v_2;
            }
            fnArgs.push(v_2);
        }
        if (fnArgs.length != 1) {
            return new SqlError('函数' + fnName + '的参数个数错误。', this.line);
        }
        var v = fnArgs[0];
        if (v == null) {
            return null;
        }
        //分组的中间数据行
        var groupByNode = ctx.selectNode.getGroupByNode();
        var groupByExpNodes = groupByNode ? groupByNode.nodes : [];
        var groupByValues = [];
        for (var i = 0; i < groupByExpNodes.length; i++) {
            var bv = groupByExpNodes[i].compute(ctx);
            if (bv instanceof SqlError) {
                return bv;
            }
            groupByValues.push(bv);
        }
        var r = t.addDataRow(new SqlDataRow(groupByValues, false));
        //分组计算
        var gv = r.values[col.index];
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
            }
            else {
                gv.value = gv.value == null ? 1 : gv.value + 1;
            }
        }
        else if (fnName == 'sum') {
            gv.value = gv.value == null ? v : v + gv.value;
        }
        else if (fnName == 'max') {
            if (gv.value == null || v > gv.value) {
                gv.value = v;
            }
        }
        else if (fnName == 'min') {
            if (gv.value == null || v < gv.value) {
                gv.value = v;
            }
        }
        else if (fnName == 'avg') {
            gv.sum += v;
            gv.count++;
            gv.value = gv.sum / gv.count;
        }
        return null;
    };
    return SqlExpFuncNode;
}(SqlNode));
